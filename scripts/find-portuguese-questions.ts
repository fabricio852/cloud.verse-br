/**
 * Encontra questões em português na tabela SAA-C03 e as remove
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

// Palavras-chave em português para identificar
const PORTUGUESE_KEYWORDS = ['empresa', 'qual', 'aplicação', 'precisa', 'solução', 'dados', 'serviço', 'usuário', 'sistema', 'arquitetura'];

function hasPortuguese(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of PORTUGUESE_KEYWORDS) {
    if (lower.includes(keyword)) count++;
  }
  return count >= 2; // Pelo menos 2 palavras em português
}

async function main() {
  console.log('🔍 Procurando questões em português no SAA-C03...\n');

  try {
    // Buscar TODAS as questões SAA-C03
    const { data: questions, error: err1 } = await supabase
      .from('questions')
      .select('id, question_text')
      .eq('certification_id', 'SAA-C03');

    if (err1 || !questions) {
      console.error('Erro:', err1?.message);
      process.exit(1);
    }

    console.log(`📊 Total de questões SAA-C03: ${questions.length}`);

    // Identificar questões em português
    const portugueseQuestions = questions.filter(q => hasPortuguese(q.question_text));

    console.log(`🇧🇷 Questões em português encontradas: ${portugueseQuestions.length}`);
    console.log(`🇺🇸 Questões em inglês: ${questions.length - portugueseQuestions.length}\n`);

    if (portugueseQuestions.length === 0) {
      console.log('✅ Nenhuma questão em português encontrada!');
      process.exit(0);
    }

    // Mostrar amostra
    console.log('📋 Amostra de questões em português:');
    portugueseQuestions.slice(0, 5).forEach((q, i) => {
      console.log(`  ${i+1}. ${q.id}`);
      console.log(`     ${q.question_text.substring(0, 80)}...`);
    });

    // Remover questões em português
    console.log(`\n🗑️  Removendo ${portugueseQuestions.length} questões em português...`);

    const portugueseIds = portugueseQuestions.map(q => q.id);

    // Remover em chunks para segurança
    const chunkSize = 50;
    let totalDeleted = 0;

    for (let i = 0; i < portugueseIds.length; i += chunkSize) {
      const chunk = portugueseIds.slice(i, i + chunkSize);

      const { error: err2, count } = await supabase
        .from('questions')
        .delete()
        .in('id', chunk);

      if (err2) {
        console.error(`❌ Erro ao deletar chunk ${i}: ${err2.message}`);
        process.exit(1);
      }

      totalDeleted += count || 0;
      console.log(`  ✅ Chunk ${Math.floor(i/chunkSize)+1}: ${count} questões removidas`);
    }

    console.log(`\n✨ Total removido: ${totalDeleted} questões`);

    // Verificar resultado
    const { data: remaining } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('certification_id', 'SAA-C03');

    console.log(`\n📊 Questões SAA-C03 restantes: ${remaining?.length || 0}`);
    console.log('✅ Limpeza concluída!');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
