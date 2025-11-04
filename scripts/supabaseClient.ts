import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente do .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.log('\n💡 Verifique se o arquivo .env.local existe e contém:');
  console.log('   VITE_SUPABASE_URL=...');
  console.log('   VITE_SUPABASE_ANON_KEY=...\n');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
