import { supabase } from './supabaseClient';

/**
 * Script para verificar se o schema do Supabase foi executado corretamente
 */
async function verifySupabase() {
  console.log('🔍 Verificando configuração do Supabase...\n');

  try {
    // 1. Verificar conexão
    console.log('1️⃣ Testando conexão...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('certifications')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ ERRO DE CONEXÃO:', connectionError.message);
      console.log('\n💡 Verifique:');
      console.log('   - As credenciais no .env.local estão corretas?');
      console.log('   - O projeto Supabase está ativo?');
      console.log('   - Você executou o schema.sql no Supabase SQL Editor?');
      return;
    }
    console.log('✅ Conexão OK\n');

    // 2. Verificar tabela certifications
    console.log('2️⃣ Verificando certificações...');
    const { data: certs, error: certsError } = await supabase
      .from('certifications')
      .select('*')
      .eq('active', true);

    if (certsError) {
      console.error('❌ ERRO ao buscar certificações:', certsError.message);
      console.log('\n💡 A tabela "certifications" não existe. Execute o schema.sql no Supabase SQL Editor!');
      return;
    }

    if (!certs || certs.length === 0) {
      console.log('⚠️  AVISO: Nenhuma certificação encontrada');
      console.log('💡 Execute o schema.sql completo - ele inclui 3 certificações (SAA-C03, CLF-C02, AIF-C01)\n');
      return;
    }

    console.log(`✅ ${certs.length} certificação(ões) encontrada(s):`);
    certs.forEach(cert => {
      console.log(`   - ${cert.short_name}: ${cert.name}`);
    });
    console.log();

    // 3. Verificar tabela questions
    console.log('3️⃣ Verificando questões...');
    const { count: questionCount, error: questionsError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (questionsError) {
      console.error('❌ ERRO ao buscar questões:', questionsError.message);
      return;
    }

    console.log(`✅ ${questionCount || 0} questão(ões) no banco\n`);

    if (!questionCount || questionCount === 0) {
      console.log('💡 Banco vazio! Use o script de importação para adicionar questões:');
      console.log('   npm run import-questions\n');
    }

    // 4. Verificar tabela profiles
    console.log('4️⃣ Verificando tabela profiles...');
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      console.error('❌ ERRO na tabela profiles:', profilesError.message);
      return;
    }
    console.log('✅ Tabela profiles OK\n');

    // 5. Resumo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SCHEMA VERIFICADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 Status:');
    console.log(`   - Certificações: ${certs.length}`);
    console.log(`   - Questões: ${questionCount || 0}`);
    console.log('');

    if (!questionCount || questionCount === 0) {
      console.log('📝 Próximo passo:');
      console.log('   1. Adicione questões nos arquivos JSON (data/certifications/)');
      console.log('   2. Execute: npm run import-questions');
      console.log('');
    } else {
      console.log('🚀 Próximo passo:');
      console.log('   1. Inicie o app: npm run dev');
      console.log('   2. Faça login e teste o quiz!');
      console.log('');
    }

  } catch (error) {
    console.error('❌ ERRO INESPERADO:', error);
    console.log('\n💡 Verifique se o arquivo .env.local existe e está configurado corretamente.');
  }
}

// Executar verificação
verifySupabase()
  .then(() => {
    console.log('✅ Verificação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
