/**
 * Remove questões em português com cleanup de respostas primeiro
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

const PORTUGUESE_KEYWORDS = ['empresa', 'qual', 'aplicação', 'precisa', 'solução', 'dados', 'serviço', 'usuário', 'sistema', 'arquitetura'];

function hasPortuguese(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of PORTUGUESE_KEYWORDS) {
    if (lower.includes(keyword)) count++;
  }
  return count >= 2;
}

async function main() {
  console.log('🧹 Removendo questões em português (com limpeza de respostas)\n');

  try {
    // 1. Buscar questões em português
    const { data: questions } = await supabase
      .from('questions')
      .select('id, question_text')
      .eq('certification_id', 'SAA-C03');

    const portugueseQuestions = questions?.filter(q => hasPortuguese(q.question_text)) || [];
    const portugueseIds = portugueseQuestions.map(q => q.id);

    console.log(`📊 Questões em português encontradas: ${portugueseIds.length}`);

    if (portugueseIds.length === 0) {
      console.log('✅ Nenhuma questão em português encontrada!');
      process.exit(0);
    }

    // 2. Remover respostas uma de cada vez (mais robusto)
    console.log(`\n🗑️  Removendo respostas para ${portugueseIds.length} questões...`);

    let answersDeleted = 0;
    for (let i = 0; i < portugueseIds.length; i++) {
      const qid = portugueseIds[i];
      const { count } = await supabase
        .from('user_answers')
        .delete()
        .eq('question_id', qid);

      if (count && count > 0) {
        answersDeleted += count;
      }

      if ((i + 1) % 25 === 0) {
        console.log(`  Processadas ${i + 1}/${portugueseIds.length} questões`);
      }
    }

    console.log(`✅ ${answersDeleted} respostas removidas`);

    // 3. Remover questões também uma de cada vez
    console.log(`\n🗑️  Removendo ${portugueseIds.length} questões...`);

    let questionsDeleted = 0;
    for (let i = 0; i < portugueseIds.length; i++) {
      const qid = portugueseIds[i];
      const { error, count } = await supabase
        .from('questions')
        .delete()
        .eq('id', qid);

      if (error) {
        console.error(`❌ Erro ao deletar ${qid}: ${error.message}`);
        continue;
      }

      if (count && count > 0) {
        questionsDeleted += count;
      }

      if ((i + 1) % 25 === 0) {
        console.log(`  Deletadas ${i + 1}/${portugueseIds.length} questões`);
      }
    }

    console.log(`✅ ${questionsDeleted} questões removidas`);

    // 4. Verificar resultado
    const { data: remaining, count } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('certification_id', 'SAA-C03');

    console.log(`\n✨ Questões SAA-C03 restantes: ${count}`);

    // Verificar se ainda há português
    const stillPortuguese = remaining?.filter(q => hasPortuguese(q.question_text || '')) || [];
    if (stillPortuguese.length > 0) {
      console.log(`⚠️  Ainda há ${stillPortuguese.length} questões em português`);
    } else {
      console.log('✅ Todas as questões em português foram removidas com sucesso!');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
