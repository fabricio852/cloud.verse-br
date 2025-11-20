import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Certification } from '../types/database';
import { supabase } from '../services/supabaseClient';
import dvaMetadata from '../data/certifications/DVA-C02/metadata.json' assert { type: 'json' };

export interface CertificationTheme {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;

  // Cores do tema
  primary: string;
  secondary: string;
  accent: string;

  // Gradientes Tailwind
  gradient: string;
  gradientHover: string;

  // Classes CSS completas
  bgGradient: string;
  textPrimary: string;
  borderPrimary: string;
  hoverBg: string;
}

// Definição dos temas por certificação (tema original)
const THEMES: Record<string, CertificationTheme> = {
  'SAA-C03': {
    id: 'SAA-C03',
    name: 'Solutions Architect Associate',
    shortName: 'SAA-C03',
    description: 'Projete arquiteturas resilientes, seguras e de alto desempenho',
    icon: '???',

    primary: '#6d28d9',
    secondary: '#4c1d95',
    accent: '#8b5cf6',

    gradient: 'from-violet-700 to-indigo-900',
    gradientHover: 'from-violet-800 to-indigo-950',

    bgGradient: 'bg-gradient-to-br from-violet-700 to-indigo-900',
    textPrimary: 'text-violet-600 dark:text-violet-300',
    borderPrimary: 'border-violet-600',
    hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-900/20'
  },

  'CLF-C02': {
    id: 'CLF-C02',
    name: 'Cloud Practitioner',
    shortName: 'CLF-C02',
    description: 'Fundamentos da nuvem AWS e principais serviços',
    icon: '??',

    primary: '#0d9488',
    secondary: '#06b6d4',
    accent: '#10b981',

    gradient: 'from-teal-500 via-cyan-500 to-emerald-500',
    gradientHover: 'from-teal-600 via-cyan-600 to-emerald-600',

    bgGradient: 'bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500',
    textPrimary: 'text-teal-600 dark:text-teal-300',
    borderPrimary: 'border-teal-500',
    hoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-900/20'
  },

  'AIF-C01': {
    id: 'AIF-C01',
    name: 'AI Practitioner',
    shortName: 'AIF-C01',
    description: 'IA e Machine Learning na AWS',
    icon: '??',

    primary: '#dc2626',
    secondary: '#991b1b',
    accent: '#ef4444',

    gradient: 'from-red-600 to-red-900',
    gradientHover: 'from-red-700 to-red-950',

    bgGradient: 'bg-gradient-to-br from-red-600 to-red-900',
    textPrimary: 'text-red-600 dark:text-red-400',
    borderPrimary: 'border-red-600',
    hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/20'
  },

  'DVA-C02': {
    id: 'DVA-C02',
    name: 'Developer - Associate',
    shortName: 'DVA-C02',
    description: 'Desenvolva e mantenha aplicações na AWS',
    icon: '??',

    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#4ade80',

    gradient: 'from-green-600 to-emerald-900',
    gradientHover: 'from-green-700 to-emerald-950',

    bgGradient: 'bg-gradient-to-br from-green-600 to-emerald-900',
    textPrimary: 'text-green-600 dark:text-green-300',
    borderPrimary: 'border-green-600',
    hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20'
  }
};

// Certifica��o DVA-C02 local (usada em ambiente de desenvolvimento mesmo que esteja oculta no Supabase)
const LOCAL_DVA_CERT: Certification = {
  id: 'DVA-C02',
  name: typeof (dvaMetadata as any).name === 'string' ? (dvaMetadata as any).name : 'Developer - Associate',
  short_name: 'DVA-C02',
  description:
    typeof (dvaMetadata as any).description === 'string'
      ? (dvaMetadata as any).description
      : 'Valide sua capacidade de desenvolver, implantar e manter aplica��es na AWS.',
  exam_duration_minutes: (dvaMetadata as any).exam_details?.duration_minutes ?? 130,
  total_questions: (dvaMetadata as any).exam_details?.total_questions ?? 65,
  passing_score: (dvaMetadata as any).exam_details?.passing_score ?? 720,
  domains: Array.isArray((dvaMetadata as any).domains)
    ? (dvaMetadata as any).domains.map((d: any) => ({
        key: d.key === 'SECURITY' ? 'DVA_SECURITY' : d.key,
        label: d.label ?? d.key,
        weight: d.weight ?? 0,
        color: d.color ?? '#22c55e',
      }))
    : [],
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface CertificationState {
  // Estado
  certifications: Certification[];
  selectedCertId: string | null; // 'SAA-C03', 'CLF-C02', 'AIF-C01'
  isLoading: boolean;

  // Actions
  fetchCertifications: () => Promise<void>;
  selectCertification: (certId: string) => void;
  getSelectedCert: () => Certification | null;
  getTheme: () => CertificationTheme;
}

export const useCertificationStore = create<CertificationState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      certifications: [],
      selectedCertId: null,
      isLoading: false,

      // Buscar certificações disponíveis
      fetchCertifications: async () => {
        set({ isLoading: true });

        try {
          // Get current locale from analytics
          const currentLocale = typeof navigator !== 'undefined' ? navigator.language : 'pt-BR';

          const { data, error } = await supabase
            .from('certifications')
            .select('*')
            .eq('active', true)
            .or(`locale.eq.all,locale.eq.${currentLocale}`)
            .order('id', { ascending: true });

          if (error) throw error;

          let certifications = data || [];

          const hasDva = certifications.some(
            (c) => (c.id || '').trim().toUpperCase() === 'DVA-C02'
          );
          if (!hasDva) {
            certifications = [...certifications, LOCAL_DVA_CERT];
          }

          set({ certifications });

          // Se nao tem certificacao selecionada, selecionar a primeira
          const { selectedCertId } = get();
          if (!selectedCertId && certifications && certifications.length > 0) {
            set({ selectedCertId: certifications[0].id });
          }
        } catch (error) {
          console.error('Error fetching certifications:', error);
          set({ certifications: [LOCAL_DVA_CERT] });
        } finally {
          set({ isLoading: false });
        }
      },

      // Selecionar certificação
      selectCertification: (certId) => {
        console.log('[certificationStore] Selecionando certificação:', certId);
        set({ selectedCertId: certId });
      },

      // Obter certificação selecionada
      getSelectedCert: () => {
        const { certifications, selectedCertId } = get();
        return certifications.find((c) => c.id === selectedCertId) || null;
      },

      // Obter tema da certificação selecionada
      getTheme: () => {
        const { selectedCertId } = get();
        const certId = selectedCertId || 'SAA-C03';
        return THEMES[certId] || THEMES['SAA-C03'];
      },
    }),
    {
      name: 'certification-storage',
      partialize: (state) => ({
        // Persistir certificação selecionada
        selectedCertId: state.selectedCertId,
      }),
    }
  )
);
