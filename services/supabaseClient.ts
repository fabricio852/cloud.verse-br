import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Cria um cliente "mock" para evitar quebra quando as variáveis do Supabase
 * não estão configuradas (ex.: rodando só com JSON local).
 */
function createMockClient(): SupabaseClient<Database> {
  const asyncOk = async () => ({ data: null, error: null });
  const asyncArray = async () => ({ data: [] as any[], error: null });

  const mockFrom = () => ({
    select: asyncArray,
    insert: asyncOk,
    update: asyncOk,
    upsert: asyncOk,
    delete: asyncOk,
    eq: () => ({
      select: asyncArray,
      single: async () => ({ data: null, error: null }),
      update: asyncOk,
    }),
    single: async () => ({ data: null, error: null }),
  });

  const mockChannel: any = {
    presenceState: () => ({}),
    on: () => mockChannel,
    subscribe: async () => 'SUBSCRIBED',
    track: async () => {},
    unsubscribe: () => {},
  };

  return {
    from: mockFrom as any,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
    },
    channel: () => mockChannel,
  } as unknown as SupabaseClient<Database>;
}

export const supabaseMissingEnv = !supabaseUrl || !supabaseAnonKey;

export const supabase = supabaseMissingEnv
  ? createMockClient()
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
