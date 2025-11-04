import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';
import { getCurrentUser, onAuthStateChange } from '../services/authService';
import { supabase } from '../services/supabaseClient';

interface AuthState {
  // Estado
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  checkDailyLimits: () => Promise<void>;
  incrementDailyQuizCount: () => Promise<void>;
  incrementAiQuestions: () => Promise<void>;
  canTakeDailyQuiz: () => boolean;
  canUseAI: () => boolean;
  isPro: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      profile: null,
      isLoading: true,
      isInitialized: false,

      // Setar usuário
      setUser: (user) => set({ user }),

      // Setar perfil
      setProfile: (profile) => set({ profile }),

      // Inicializar (rodar uma vez no app start)
      initialize: async () => {
        set({ isLoading: true });

        try {
          // Buscar usuário atual
          const user = await getCurrentUser();
          set({ user });

          if (user) {
            // Buscar perfil
            await get().fetchProfile();
          }

          // Listener para mudanças de auth
          onAuthStateChange(async (user) => {
            set({ user });
            if (user) {
              await get().fetchProfile();
            } else {
              set({ profile: null });
            }
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      // Buscar perfil do usuário
      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          set({ profile: data });

          // Verificar e resetar limites diários se necessário
          await get().checkDailyLimits();
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      },

      // Atualizar perfil
      updateProfile: async (updates) => {
        const { user, profile } = get();
        if (!user || !profile) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .select()
            .single();

          if (error) throw error;
          set({ profile: data });
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      },

      // Verificar e resetar limites diários (se passou de 24h)
      checkDailyLimits: async () => {
        const { profile } = get();
        if (!profile || profile.plan !== 'FREE') return;

        const resetTime = new Date(profile.daily_quiz_reset_at);
        const now = new Date();
        const hoursSinceReset = (now.getTime() - resetTime.getTime()) / (1000 * 60 * 60);

        // Se passou 24h, resetar limites
        if (hoursSinceReset >= 24) {
          await get().updateProfile({
            daily_quiz_count: 0,
            ai_questions_today: 0,
            daily_quiz_reset_at: now.toISOString(),
          });
        }
      },

      // Incrementar contador de quiz diário
      incrementDailyQuizCount: async () => {
        const { profile } = get();
        if (!profile || profile.plan !== 'FREE') return;

        await get().updateProfile({
          daily_quiz_count: profile.daily_quiz_count + 1,
        });
      },

      // Incrementar contador de perguntas IA
      incrementAiQuestions: async () => {
        const { profile } = get();
        if (!profile || profile.plan !== 'FREE') return;

        await get().updateProfile({
          ai_questions_today: profile.ai_questions_today + 1,
        });
      },

      // Verificar se pode fazer quiz diário
      canTakeDailyQuiz: () => {
        const { profile } = get();
        if (!profile) return false;
        if (profile.plan !== 'FREE') return true; // PRO: ilimitado
        return profile.daily_quiz_count < 1; // FREE: 1 quiz/dia
      },

      // Verificar se pode usar IA
      canUseAI: () => {
        const { profile } = get();
        if (!profile) return false;
        if (profile.plan !== 'FREE') return true; // PRO: ilimitado
        return profile.ai_questions_today < 1; // FREE: 1 pergunta/dia
      },

      // Verificar se é PRO
      isPro: () => {
        const { profile } = get();
        return profile?.plan === 'PRO' || profile?.plan === 'PRO_PLUS';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Persistir apenas o necessário
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
