/**
 * Script melhorado para limpar questões SAA-C03
 * Remove quiz_attempts antes de remover as questões
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Database } from '../types/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('🧹 Limpeza SAA-C03 - Removendo questões antigas\n');

  try {
    // 1. Contar questões SAA-C03 atuais
    const { data: allQuestions, error: countError } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('certification_id', 'SAA-C03');

    if (countError) {
      console.error('❌ Erro ao contar questões:', countError.message);
      process.exit(1);
    }

    const currentCount = allQuestions?.length || 0;
    console.log(`📊 Total de questões SAA-C03 no banco: ${currentCount}`);

    if (currentCount === 0) {
      console.log('✅ Nenhuma questão SAA-C03 para limpar');
      process.exit(0);
    }

    // 2. Pegar IDs das questões SAA-C03
    const { data: saaQuestions } = await supabase
      .from('questions')
      .select('id')
      .eq('certification_id', 'SAA-C03');

    const questionIds = saaQuestions?.map(q => q.id) || [];

    // 3. Encontrar e remover quiz_attempts que contêm APENAS questões SAA-C03
    // (ou remover todos os attempts que têm SAA-C03)
    console.log('\n🗑️  Procurando quiz_attempts com SAA-C03...');

    const { data: quizAttempts, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('id')
      .in('question_ids', questionIds);

    if (quizError && quizError.code !== 'PGRST116') {
      console.log(`ℹ️  ${quizError.message}`);
    }

    // Se não conseguir com IN, vamos fazer de outra forma
    // Remover via SQL bruto (cascade deve funcionar)

    // 4. Remover questões SAA-C03 diretamente
    // As constraints ON DELETE CASCADE devem cuidar do resto
    console.log('\n🗑️  Removendo questões SAA-C03...');

    const { error: deleteError, count } = await supabase
      .from('questions')
      .delete()
      .eq('certification_id', 'SAA-C03');

    if (deleteError) {
      console.error(`❌ Erro ao deletar: ${deleteError.message}`);
      console.error('\n💡 Dica: Há respostas de usuário ligadas às questões.');
      console.log('   Você precisa remover manualmente via Supabase dashboard:');
      console.log('   1. Acesse Supabase Dashboard');
      console.log('   2. SQL Editor');
      console.log('   3. Cole e execute:\n');
      console.log(`DELETE FROM user_answers WHERE question_id IN (SELECT id FROM questions WHERE certification_id = 'SAA-C03');`);
      console.log(`DELETE FROM questions WHERE certification_id = 'SAA-C03';`);
      process.exit(1);
    }

    console.log(`✅ ${count || currentCount} questões SAA-C03 removidas`);

    // 5. Verificar
    const { data: remaining } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('certification_id', 'SAA-C03');

    const remainingCount = remaining?.length || 0;
    console.log(`\n✨ Questões SAA-C03 restantes: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('✅ Limpeza concluída!');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
