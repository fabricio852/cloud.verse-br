/**
 * Remove as questões SAA-C03 antigas (em português - que são CLF)
 * Mantém apenas as 205 novas questões em inglês
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

// Palavras-chave em português para identificar questões antigas
const PORTUGUESE_KEYWORDS = [
  'empresa',
  'precisa',
  'solução',
  'melhor',
  'serviço',
  'dados',
  'aplicação',
  'usuários',
  'sistema',
  'arquitetura'
];

function isPortuguese(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of PORTUGUESE_KEYWORDS) {
    if (lower.includes(keyword)) count++;
  }
  // Se tiver pelo menos 3 palavras-chave em português, é provavelmente português
  return count >= 3;
}

async function main() {
  console.log('🧹 Removendo questões SAA-C03 antigas (em português)\n');

  try {
    // 1. Buscar todas as questões SAA-C03
    console.log('📋 Buscando questões SAA-C03...');
    const { data: questions, error: err1 } = await supabase
      .from('questions')
      .select('id, question_text')
      .eq('certification_id', 'SAA-C03');

    if (err1 || !questions) {
      console.error('Erro:', err1?.message);
      process.exit(1);
    }

    console.log(`Total: ${questions.length} questões\n`);

    // 2. Identificar questões antigas (português)
    const oldQuestions = questions.filter(q => isPortuguese(q.question_text));
    const newQuestions = questions.filter(q => !isPortuguese(q.question_text));

    console.log(`📊 Análise:`);
    console.log(`  - Questões em português (antigas): ${oldQuestions.length}`);
    console.log(`  - Questões em inglês (novas): ${newQuestions.length}`);

    if (oldQuestions.length === 0) {
      console.log('\n✅ Nenhuma questão antiga encontrada!');
      process.exit(0);
    }

    console.log(`\n🔍 Amostra das questões antigas a remover:`);
    oldQuestions.slice(0, 3).forEach((q, i) => {
      console.log(`  ${i+1}. ${q.question_text.substring(0, 70)}...`);
    });

    const oldIds = oldQuestions.map(q => q.id);

    // 3. Remover respostas
    console.log(`\n🗑️  Removendo respostas para ${oldIds.length} questões...`);
    const { error: err2, count: answerCount } = await supabase
      .from('user_answers')
      .delete()
      .in('question_id', oldIds);

    if (err2) {
      console.error('Erro:', err2.message);
      process.exit(1);
    }
    console.log(`✅ ${answerCount || 0} respostas removidas`);

    // 4. Remover questões
    console.log(`\n🗑️  Removendo ${oldIds.length} questões antigas...`);
    const { error: err3, count: qCount } = await supabase
      .from('questions')
      .delete()
      .in('id', oldIds);

    if (err3) {
      console.error('Erro:', err3.message);

      // Se falhour, mostrar instruções manuais
      console.log('\n💡 Instruções manuais:');
      console.log('1. Acesse https://supabase.com/dashboard');
      console.log('2. SQL Editor');
      console.log('3. Cole e execute:');
      console.log(`\nDELETE FROM user_answers WHERE question_id IN (${oldIds.map(id => `'${id}'`).join(',')});`);
      console.log(`DELETE FROM questions WHERE id IN (${oldIds.map(id => `'${id}'`).join(',')});`);
      process.exit(1);
    }

    console.log(`✅ ${qCount} questões removidas`);

    // 5. Verificar resultado
    console.log(`\n✨ Verificando resultado...`);
    const { data: remaining } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('certification_id', 'SAA-C03');

    const remainingCount = remaining?.length || 0;
    console.log(`Questões SAA-C03 restantes: ${remainingCount}`);

    if (remainingCount === newQuestions.length) {
      console.log(`\n✅ Limpeza concluída com sucesso!`);
      console.log(`✅ Mantidas ${newQuestions.length} questões novas em inglês`);
    } else {
      console.log(`\n⚠️  Resultado inesperado. Esperava ${newQuestions.length}, obteve ${remainingCount}`);
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
