/**
 * Verifica se a migração multiselect foi aplicada
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

async function checkMigration() {
  console.log('🔍 Verificando status da migração multiselect...\n');

  // Tentar buscar uma questão multiselect
  const { data: multiselect, error: msError } = await supabase
    .from('questions')
    .select('id, correct_answers, required_selection_count')
    .eq('id', 'aif-c01-ml_development-206')
    .single();

  // Tentar buscar uma questão com option_e
  const { data: withE, error: eError } = await supabase
    .from('questions')
    .select('id, option_e')
    .eq('id', 'aif-c01-responsible_ai-039')
    .single();

  console.log('📊 Resultados:\n');

  // Verificar correct_answers e required_selection_count
  if (msError) {
    if (msError.message.includes('correct_answers') || msError.message.includes('required_selection_count')) {
      console.log('❌ Colunas multiselect NÃO existem no banco');
      console.log('   Erro:', msError.message);
    } else {
      console.log('⚠️  Questão não encontrada ou outro erro:', msError.message);
    }
  } else {
    console.log('✅ Colunas multiselect EXISTEM');
    console.log('   Questão:', multiselect?.id);
    console.log('   correct_answers:', multiselect?.correct_answers);
    console.log('   required_selection_count:', multiselect?.required_selection_count);
  }

  console.log('');

  // Verificar option_e
  if (eError) {
    if (eError.message.includes('option_e')) {
      console.log('❌ Coluna option_e NÃO existe no banco');
      console.log('   Erro:', eError.message);
    } else {
      console.log('⚠️  Questão não encontrada ou outro erro:', eError.message);
    }
  } else {
    console.log('✅ Coluna option_e EXISTE');
    console.log('   Questão:', withE?.id);
    console.log('   option_e:', withE?.option_e || '(null)');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (msError || eError) {
    console.log('🔴 STATUS: Migração NÃO foi aplicada');
    console.log('\n📋 PRÓXIMO PASSO:');
    console.log('Execute a migração SQL conforme instruções em CORRIGIR_AGORA.md');
  } else {
    if (multiselect?.correct_answers && multiselect.correct_answers.length > 1) {
      console.log('🟢 STATUS: Migração aplicada e dados CORRETOS!');
    } else {
      console.log('🟡 STATUS: Migração aplicada mas dados incompletos');
      console.log('\n📋 PRÓXIMO PASSO:');
      console.log('Reimporte as questões com: npm run import-aif -- --cert=AIF-C01 --file=data/aif-questions.json');
    }
  }
}

checkMigration().catch(error => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
