import { supabase } from './supabaseClient';
import * as fs from 'fs';
import * as path from 'path';

interface QuestionJSON {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation_basic: string;
  explanation_detailed: string;
  incorrect_explanations: {
    [key: string]: string;
  };
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'FREE' | 'PRO';
}

interface DomainFile {
  certification: string;
  domain: string;
  questions: QuestionJSON[];
}

/**
 * Verifica se uma questão está completa (não é um template)
 */
function isCompleteQuestion(q: QuestionJSON): boolean {
  return (
    !q.question.includes('[ADICIONE SUA QUESTÃO AQUI]') &&
    !q.options.A.includes('[Opção A]') &&
    q.explanation_basic.trim().length > 10
  );
}

/**
 * Converte questão do formato JSON para formato do banco
 */
function convertQuestionToDbFormat(q: QuestionJSON, certId: string, domain: string) {
  return {
    id: q.id,
    certification_id: certId,
    domain: domain,
    question_text: q.question,
    option_a: q.options.A,
    option_b: q.options.B,
    option_c: q.options.C,
    option_d: q.options.D,
    correct_answer: q.correct,
    explanation_basic: q.explanation_basic,
    explanation_detailed: q.explanation_detailed,
    incorrect_explanations: q.incorrect_explanations,
    tags: q.tags,
    difficulty: q.difficulty,
    tier: q.tier,
    active: true,
  };
}

/**
 * Importa questões dos arquivos JSON para o Supabase
 */
async function importQuestions() {
  console.log('📦 IMPORTAÇÃO DE QUESTÕES PARA SUPABASE\n');

  try {
    // 1. Verificar conexão
    console.log('1️⃣ Verificando conexão com Supabase...');
    const { data: certs, error: certsError } = await supabase
      .from('certifications')
      .select('id, short_name')
      .eq('active', true);

    if (certsError) {
      console.error('❌ ERRO:', certsError.message);
      console.log('\n💡 Execute o schema.sql no Supabase SQL Editor primeiro!');
      return;
    }

    if (!certs || certs.length === 0) {
      console.log('⚠️  Nenhuma certificação encontrada!');
      console.log('💡 Execute o schema.sql completo no Supabase SQL Editor.');
      return;
    }

    console.log(`✅ ${certs.length} certificação(ões) encontrada(s)\n`);

    // 2. Ler arquivos JSON
    console.log('2️⃣ Lendo arquivos de questões...');
    const dataPath = path.join(process.cwd(), 'data', 'certifications');
    const allQuestions: any[] = [];
    let totalComplete = 0;
    let totalTemplates = 0;

    for (const cert of certs) {
      const certPath = path.join(dataPath, cert.id);

      if (!fs.existsSync(certPath)) {
        console.log(`⚠️  Pasta não encontrada: ${cert.id}`);
        continue;
      }

      // Ler arquivos de domínios
      const domainFiles = ['secure.json', 'resilient.json', 'performance.json', 'cost.json'];

      for (const fileName of domainFiles) {
        const filePath = path.join(certPath, fileName);

        if (!fs.existsSync(filePath)) continue;

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const domainData: DomainFile = JSON.parse(fileContent);

        for (const question of domainData.questions) {
          if (isCompleteQuestion(question)) {
            const dbQuestion = convertQuestionToDbFormat(
              question,
              cert.id,
              domainData.domain
            );
            allQuestions.push(dbQuestion);
            totalComplete++;
          } else {
            totalTemplates++;
          }
        }
      }
    }

    console.log(`✅ ${totalComplete} questão(ões) completa(s) encontrada(s)`);
    if (totalTemplates > 0) {
      console.log(`ℹ️  ${totalTemplates} template(s) ignorado(s)\n`);
    }

    if (totalComplete === 0) {
      console.log('\n⚠️  NENHUMA QUESTÃO PARA IMPORTAR!');
      console.log('\n💡 Adicione questões nos arquivos JSON:');
      console.log('   - data/certifications/SAA-C03/secure.json');
      console.log('   - data/certifications/SAA-C03/resilient.json');
      console.log('   - etc...');
      console.log('\nVeja o exemplo completo em secure.json (questão saa-secure-001)\n');
      return;
    }

    // 3. Importar para o Supabase
    console.log('3️⃣ Importando questões para o Supabase...');

    // Usar upsert para evitar duplicatas
    const { data: inserted, error: insertError } = await supabase
      .from('questions')
      .upsert(allQuestions, { onConflict: 'id' })
      .select('id');

    if (insertError) {
      console.error('❌ ERRO ao importar:', insertError.message);
      console.log('\n💡 Detalhes:', insertError);
      return;
    }

    console.log(`✅ ${inserted?.length || 0} questão(ões) importada(s) com sucesso!\n`);

    // 4. Verificar resultado
    console.log('4️⃣ Verificando dados importados...');
    const { count: totalInDb, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (!countError) {
      console.log(`✅ Total de questões no banco: ${totalInDb}\n`);
    }

    // 5. Estatísticas por domínio
    const { data: domainStats } = await supabase
      .from('questions')
      .select('domain, tier')
      .eq('active', true);

    if (domainStats) {
      console.log('📊 Estatísticas por domínio:');
      const stats: any = {};

      domainStats.forEach((q: any) => {
        if (!stats[q.domain]) {
          stats[q.domain] = { FREE: 0, PRO: 0, total: 0 };
        }
        stats[q.domain][q.tier]++;
        stats[q.domain].total++;
      });

      Object.entries(stats).forEach(([domain, data]: [string, any]) => {
        console.log(`   ${domain}: ${data.total} (${data.FREE} FREE + ${data.PRO} PRO)`);
      });
      console.log();
    }

    // 6. Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🚀 Próximos passos:');
    console.log('   1. Inicie o app: npm run dev');
    console.log('   2. Faça login');
    console.log('   3. Teste o quiz!');
    console.log('');

  } catch (error) {
    console.error('❌ ERRO INESPERADO:', error);
  }
}

// Executar importação
importQuestions()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
