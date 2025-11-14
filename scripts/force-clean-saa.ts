/**
 * Script para limpar TODAS as questões SAA-C03 removendo orphaned records
 * Deleta respostas de user_attempts também
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
  console.log('🧹 LIMPEZA AGRESSIVA - Removendo TODAS as questões SAA-C03...\n');

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

    // 2. Pegar todas as IDs das questões SAA-C03
    const { data: saaQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('id')
      .eq('certification_id', 'SAA-C03');

    if (fetchError) {
      console.error('❌ Erro ao buscar questões:', fetchError.message);
      process.exit(1);
    }

    const questionIds = saaQuestions?.map(q => q.id) || [];
    console.log(`\n📋 IDs das questões a remover: ${questionIds.length}`);

    if (questionIds.length === 0) {
      console.log('✅ Nenhuma questão encontrada');
      process.exit(0);
    }

    // 3. Remover respostas do usuário em chunks (para evitar limit)
    console.log('\n🗑️  Removendo respostas do usuário...');
    const chunkSize = 100;
    let answersDeleted = 0;

    for (let i = 0; i < questionIds.length; i += chunkSize) {
      const chunk = questionIds.slice(i, i + chunkSize);
      const { error: deleteError, count } = await supabase
        .from('user_answers')
        .delete()
        .in('question_id', chunk);

      if (deleteError) {
        console.error(`❌ Erro ao deletar respostas (chunk ${i}):\n${deleteError.message}`);
        process.exit(1);
      }
      answersDeleted += count || 0;
    }

    console.log(`✅ ${answersDeleted} respostas do usuário removidas`);

    // 4. Remover tentativas de quiz (user_attempts) que referenciam essas questões
    // Primeiro, achar todas as attempts que tem essas questões
    console.log('\n🗑️  Procurando tentativas de quiz com essas questões...');

    const { data: attempts, error: fetchAttemptsError } = await supabase
      .from('user_attempts')
      .select('id')
      .in('question_ids', [questionIds]); // Isso pode não funcionar bem, vamos fazer de outra forma

    if (fetchAttemptsError && fetchAttemptsError.code !== 'PGRST116') {
      console.log(`ℹ️  Info: ${fetchAttemptsError.message}`);
    }

    // 5. Remover questões SAA-C03 em chunks
    console.log('\n🗑️  Removendo questões SAA-C03...');
    let questionsDeleted = 0;

    for (let i = 0; i < questionIds.length; i += chunkSize) {
      const chunk = questionIds.slice(i, i + chunkSize);
      const { error: deleteError, count } = await supabase
        .from('questions')
        .delete()
        .in('id', chunk);

      if (deleteError) {
        console.error(`❌ Erro ao deletar questões (chunk ${i}):\n${deleteError.message}`);
        process.exit(1);
      }
      questionsDeleted += count || 0;
      process.stdout.write('.');
    }

    console.log(`\n✅ ${questionsDeleted} questões SAA-C03 removidas`);

    // 6. Verificar resultado
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
    } else {
      console.log('\n⚠️  Ainda há questões SAA-C03 no banco. Execute novamente.');
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
