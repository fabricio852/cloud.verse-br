/**
 * Deleta questões antigas uma de cada vez com retry
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
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const OLD_QUESTION_IDS = [
  'saa-c03-cost-008','saa-c03-secure-012','saa-c03-cost-013','saa-c03-resilient-019','saa-c03-secure-217',
  'saa-c03-resilient-034','saa-c03-secure-020','saa-c03-secure-032','saa-c03-secure-059','saa-c03-performance-149',
  'saa-c03-cost-187','saa-c03-resilient-204','saa-c03-resilient-181','saa-c03-performance-002','saa-c03-performance-174',
  'saa-c03-resilient-171','saa-c03-secure-175','saa-c03-secure-210','saa-c03-secure-212','saa-c03-secure-218',
  'saa-c03-secure-241','saa-c03-secure-244','saa-c03-resilient-189','saa-c03-performance-202','saa-c03-secure-234',
  'saa-c03-secure-208','saa-c03-secure-213','saa-c03-performance-231','saa-c03-secure-226','saa-c03-secure-230',
  'saa-c03-cost-246'
];

async function deleteQuestion(qid: string, retry: number = 0): Promise<boolean> {
  const { error, count } = await supabase
    .from('questions')
    .delete()
    .eq('id', qid);

  if (error) {
    if (retry < 2) {
      // Tentar novamente após pequeno delay
      await new Promise(r => setTimeout(r, 200));
      return deleteQuestion(qid, retry + 1);
    }
    console.error(`❌ ${qid}: ${error.message}`);
    return false;
  }

  if (count && count > 0) {
    console.log(`✅ ${qid}: deletada`);
    return true;
  }
  return false;
}

async function main() {
  console.log('🧹 Deletando questões antigas uma de cada vez\n');

  let successCount = 0;
  let failCount = 0;

  for (const qid of OLD_QUESTION_IDS) {
    const success = await deleteQuestion(qid);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Delay entre deletes
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n✨ Resultado:`);
  console.log(`✅ ${successCount} deletadas`);
  console.log(`❌ ${failCount} falharam`);

  // Verificar resultado final
  const { data: remaining } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('certification_id', 'SAA-C03');

  const remainingCount = remaining?.length || 0;
  console.log(`\n📊 Questões SAA-C03 restantes: ${remainingCount}`);

  if (failCount > 0) {
    console.log('\n💡 Se ainda houver erros, as questões podem ter respostas órfãs ainda referenciadas.');
    process.exit(1);
  }
}

main();
