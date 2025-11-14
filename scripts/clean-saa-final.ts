/**
 * Script final para limpar SAA-C03
 * Remove tudo em cascata corretamente
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

async function main() {
  console.log('🧹 Limpeza FINAL de SAA-C03\n');

  try {
    // 1. Contar questões SAA-C03
    const { count: qCount, error: err1 } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('certification_id', 'SAA-C03');

    console.log(`📊 Questões SAA-C03: ${qCount}`);

    if (!qCount || qCount === 0) {
      console.log('✅ Nada para limpar');
      process.exit(0);
    }

    // 2. Buscar todas as IDs
    console.log('\n📋 Buscando IDs das questões...');
    const { data: questions, error: err2 } = await supabase
      .from('questions')
      .select('id')
      .eq('certification_id', 'SAA-C03');

    if (err2 || !questions) {
      console.error('Erro:', err2?.message);
      process.exit(1);
    }

    const questionIds = questions.map(q => q.id);
    console.log(`✅ ${questionIds.length} questões encontradas`);

    // 3. Remover TODAS as respostas
    console.log('\n🗑️  Removendo respostas...');
    const { error: err3, count: answerCount } = await supabase
      .from('user_answers')
      .delete()
      .in('question_id', questionIds);

    if (err3) {
      console.error('Erro ao remover respostas:', err3.message);
      process.exit(1);
    }
    console.log(`✅ ${answerCount} respostas removidas`);

    // 4. Remover questões
    console.log('\n🗑️  Removendo questões...');
    const { error: err4, count: qDeletedCount } = await supabase
      .from('questions')
      .delete()
      .in('id', questionIds);

    if (err4) {
      console.error('Erro ao remover questões:', err4.message);
      process.exit(1);
    }
    console.log(`✅ ${qDeletedCount} questões removidas`);

    // 5. Verificar
    console.log('\n✨ Verificando...');
    const { count: finalCount } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('certification_id', 'SAA-C03');

    console.log(`Questões SAA-C03 restantes: ${finalCount}`);

    if (finalCount === 0) {
      console.log('\n✅ Limpeza concluída com sucesso!');
      console.log('📝 Próximo passo: npm run import-custom -- --file=data/saa-questions-converted.json --cert=SAA-C03');
    }

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error.message);
    process.exit(1);
  }
}

main();
