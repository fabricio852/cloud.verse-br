/**
 * Script para limpar questões antigas SAA-C03 e remover respostas órfãs
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
  console.log('🧹 Limpando questões antigas SAA-C03...\n');

  try {
    // 1. Contar questões SAA-C03 atuais
    const { data: questions, error: countError } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('certification_id', 'SAA-C03');

    if (countError) {
      console.error('❌ Erro ao contar questões:', countError.message);
      process.exit(1);
    }

    const currentCount = questions?.length || 0;
    console.log(`📊 Questões SAA-C03 atuais: ${currentCount}`);

    if (currentCount === 0) {
      console.log('✅ Nenhuma questão SAA-C03 encontrada para limpar');
      process.exit(0);
    }

    // 2. Deletar respostas do usuário para questões SAA-C03 (para evitar constraint de foreign key)
    console.log('\n🗑️  Removendo respostas do usuário para SAA-C03...');

    const { data: saaQuestions } = await supabase
      .from('questions')
      .select('id')
      .eq('certification_id', 'SAA-C03');

    if (saaQuestions && saaQuestions.length > 0) {
      const questionIds = saaQuestions.map(q => q.id);

      const { error: deleteAnswersError } = await supabase
        .from('user_answers')
        .delete()
        .in('question_id', questionIds);

      if (deleteAnswersError) {
        console.error('❌ Erro ao deletar respostas:', deleteAnswersError.message);
        process.exit(1);
      }

      console.log(`✅ Respostas do usuário removidas`);
    }

    // 3. Deletar questões SAA-C03
    console.log('\n🗑️  Removendo questões SAA-C03...');

    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('certification_id', 'SAA-C03');

    if (deleteError) {
      console.error('❌ Erro ao deletar questões:', deleteError.message);
      process.exit(1);
    }

    console.log(`✅ ${currentCount} questões SAA-C03 removidas com sucesso`);

    // 4. Verificar resultado
    const { data: remaining, error: verifyError } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('certification_id', 'SAA-C03');

    if (verifyError) {
      console.error('❌ Erro ao verificar:', verifyError.message);
      process.exit(1);
    }

    const remainingCount = remaining?.length || 0;
    console.log(`\n✨ Verificação final: ${remainingCount} questões SAA-C03 restantes`);

    if (remainingCount === 0) {
      console.log('\n✅ Limpeza concluída com sucesso!');
      console.log('📝 Próximo passo: npm run import-custom -- --file=data/saa-questions-converted.json --cert=SAA-C03');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
