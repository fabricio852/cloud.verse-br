/**
 * Script para mostrar exemplo de questão
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function showExample() {
  console.log('📝 Buscando exemplo de questão CLF-C02...\n');

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('certification_id', 'CLF-C02')
      .limit(1)
      .single();

    if (error) throw error;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 EXEMPLO DE QUESTÃO CLF-C02');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🆔 ID:', data.id);
    console.log('📚 Certificação:', data.certification_id);
    console.log('🏷️  Domínio:', data.domain);
    console.log('📊 Dificuldade:', data.difficulty);
    console.log('🎯 Tier:', data.tier);
    console.log('🔢 Seleções requeridas:', data.required_selection_count);
    console.log('\n❓ QUESTÃO:');
    console.log(data.question_text);
    console.log('\n📌 OPÇÕES:');
    console.log('A)', data.option_a);
    console.log('B)', data.option_b);
    console.log('C)', data.option_c);
    console.log('D)', data.option_d);
    if (data.option_e) {
      console.log('E)', data.option_e);
    }
    console.log('\n✅ RESPOSTA(S) CORRETA(S):', JSON.stringify(data.correct_answers));
    console.log('\n💡 EXPLICAÇÃO DETALHADA:');
    console.log(data.explanation_detailed);
    console.log('\n❌ EXPLICAÇÕES DAS INCORRETAS:');
    console.log(JSON.stringify(data.incorrect_explanations, null, 2));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

showExample();
