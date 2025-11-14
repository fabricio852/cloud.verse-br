/**
 * Executa o SQL de limpeza via Supabase RPC ou via fetch direto
 */

import { config } from 'dotenv';
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

const oldQuestionIds = [
  'saa-c03-cost-008','saa-c03-secure-012','saa-c03-cost-013','saa-c03-resilient-019','saa-c03-secure-217',
  'saa-c03-resilient-034','saa-c03-secure-020','saa-c03-secure-032','saa-c03-secure-059','saa-c03-performance-149',
  'saa-c03-cost-187','saa-c03-resilient-204','saa-c03-resilient-181','saa-c03-performance-002','saa-c03-performance-174',
  'saa-c03-resilient-171','saa-c03-secure-175','saa-c03-secure-210','saa-c03-secure-212','saa-c03-secure-218',
  'saa-c03-secure-241','saa-c03-secure-244','saa-c03-resilient-189','saa-c03-performance-202','saa-c03-secure-234',
  'saa-c03-secure-208','saa-c03-secure-213','saa-c03-performance-231','saa-c03-secure-226','saa-c03-secure-230',
  'saa-c03-cost-246'
];

async function executeDelete() {
  console.log('🧹 Executando limpeza via REST API\n');

  try {
    // Remover respostas
    console.log('Step 1: Removendo respostas do usuário...');
    const deleteAnswersUrl = new URL(`${SUPABASE_URL}/rest/v1/user_answers`);
    deleteAnswersUrl.searchParams.append('question_id', `in.(${oldQuestionIds.join(',')})`);

    const resp1 = await fetch(deleteAnswersUrl.toString(), {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation',
      }
    });

    console.log(`Status: ${resp1.status}`);
    if (!resp1.ok) {
      const error = await resp1.text();
      console.error('Erro:', error);
    } else {
      console.log('✅ Respostas removidas');
    }

    // Remover questões
    console.log('\nStep 2: Removendo questões...');
    const deleteQuestionsUrl = new URL(`${SUPABASE_URL}/rest/v1/questions`);
    deleteQuestionsUrl.searchParams.append('id', `in.(${oldQuestionIds.join(',')})`);

    const resp2 = await fetch(deleteQuestionsUrl.toString(), {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=representation',
      }
    });

    console.log(`Status: ${resp2.status}`);
    if (!resp2.ok) {
      const error = await resp2.text();
      console.error('Erro:', error);
      process.exit(1);
    } else {
      const deleted = await resp2.json();
      console.log(`✅ ${deleted.length} questões removidas`);
    }

    console.log('\n✨ Limpeza concluída!');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

executeDelete();
