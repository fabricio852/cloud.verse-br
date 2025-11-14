/**
 * Força delete das 5 questões que falharam
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Erro: variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const errorIds = [
  'saa-c03-resilient-010',
  'saa-c03-secure-029',
  'saa-c03-secure-132',
  'saa-c03-secure-032',
  'saa-c03-secure-037'
];

async function main() {
  console.log('Deletando 5 questões com constraint error...\n');

  let deleted = 0;
  let failed = 0;

  for (const id of errorIds) {
    const { error, count } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.log(`✗ ${id}: ${error.code} - ${error.message}`);
      failed++;
    } else {
      console.log(`✓ ${id}: deletada`);
      deleted += count || 0;
    }
  }

  console.log(`\nResultado: ${deleted} deletadas, ${failed} falharam`);
}

main();
