/**
 * Remove TODAS as respostas órfãs (referenciando questões que não existem)
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

async function main() {
  console.log('🧹 Removendo respostas órfãs\n');

  try {
    let totalDeleted = 0;

    for (let i = 0; i < OLD_QUESTION_IDS.length; i++) {
      const qid = OLD_QUESTION_IDS[i];

      const { error, count } = await supabase
        .from('user_answers')
        .delete()
        .eq('question_id', qid);

      if (error) {
        console.error(`❌ Erro para ${qid}:`, error.message);
      } else {
        if (count && count > 0) {
          console.log(`✅ ${qid}: ${count} respostas removidas`);
          totalDeleted += count;
        }
      }

      // Pequeno delay para evitar rate limiting
      if ((i + 1) % 5 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    console.log(`\n✨ Total removido: ${totalDeleted} respostas`);
    console.log('\n📝 Próximo passo: Executar novamente o script de remoção de questões antigas');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
