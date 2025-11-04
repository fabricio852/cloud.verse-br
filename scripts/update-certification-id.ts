/**
 * Script para atualizar o certification_id das questões
 * De SAA-C03 para CLF-C02
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Carregar variáveis de ambiente do .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function updateCertificationId() {
  console.log('🔄 Iniciando atualização do certification_id...\n');

  try {
    // 1. Verificar quantas questões existem com SAA-C03
    const { data: saaQuestions, error: saaError } = await supabase
      .from('questions')
      .select('id, question_text, certification_id')
      .eq('certification_id', 'SAA-C03');

    if (saaError) {
      console.error('❌ Erro ao buscar questões SAA-C03:', saaError);
      return;
    }

    console.log(`📊 Encontradas ${saaQuestions?.length || 0} questões com certification_id = SAA-C03`);

    if (!saaQuestions || saaQuestions.length === 0) {
      console.log('✅ Nenhuma questão para atualizar.');
      return;
    }

    // Mostrar algumas questões de exemplo
    console.log('\n📝 Exemplos de questões que serão atualizadas:');
    saaQuestions.slice(0, 3).forEach((q, idx) => {
      console.log(`  ${idx + 1}. ID: ${q.id} - ${q.question_text.substring(0, 60)}...`);
    });

    // 2. Confirmar se deve prosseguir
    console.log(`\n⚠️  Você está prestes a atualizar ${saaQuestions.length} questões de SAA-C03 para CLF-C02`);
    console.log('   Para confirmar, execute o script com o parâmetro --confirm\n');

    // Verificar se o usuário confirmou
    const confirmed = process.argv.includes('--confirm');

    if (!confirmed) {
      console.log('ℹ️  Execute novamente com --confirm para prosseguir:');
      console.log('   npm run update-cert -- --confirm\n');
      return;
    }

    // 3. Atualizar as questões
    console.log('\n🔄 Atualizando questões...');

    const { data: updated, error: updateError } = await supabase
      .from('questions')
      .update({ certification_id: 'CLF-C02' })
      .eq('certification_id', 'SAA-C03')
      .select('id');

    if (updateError) {
      console.error('❌ Erro ao atualizar questões:', updateError);
      return;
    }

    console.log(`✅ ${updated?.length || 0} questões atualizadas com sucesso!`);

    // 4. Verificar resultado
    const { data: clfQuestions, error: clfError } = await supabase
      .from('questions')
      .select('id')
      .eq('certification_id', 'CLF-C02');

    if (!clfError) {
      console.log(`✅ Total de questões CLF-C02: ${clfQuestions?.length || 0}\n`);
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar
updateCertificationId();
