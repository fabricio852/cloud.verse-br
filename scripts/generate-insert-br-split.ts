/**
 * Script para gerar INSERT SQL das questões traduzidas em 3 arquivos separados
 * Um arquivo por certificação (SAA-C03, CLF-C02, AIF-C01)
 * Isso evita o erro "Query is too large" do Supabase SQL Editor
 *
 * Usa DOLLAR QUOTING para evitar problemas com caracteres especiais
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CERT_FILES: Record<string, string> = {
  'SAA-C03': 'data/saa-questions-br.json',
  'CLF-C02': 'data/clf-questions-br.json',
  'AIF-C01': 'data/aif-questions-br.json'
};

function escapeSql(str: string): string {
  if (!str) return '';
  // Não precisa escapar quando usamos dollar quoting
  return str;
}

function normalizeDomain(domain: string): string {
  const mapping: Record<string, string> = {
    'DESIGN_SECURE_APPLICATIONS_ARCHITECTURES': 'SECURE',
    'DESIGN_RESILIENT_ARCHITECTURES': 'RESILIENT',
    'DESIGN_HIGH_PERFORMING_ARCHITECTURES': 'PERFORMANCE',
    'DESIGN_COST_OPTIMIZED_ARCHITECTURES': 'COST',
    'CLOUD_CONCEPTS': 'CLOUD_CONCEPTS',
    'CLOUD_TECHNOLOGY_SERVICES': 'CLOUD_TECHNOLOGY_SERVICES',
    'SECURITY_COMPLIANCE': 'SECURITY_COMPLIANCE',
    'BILLING_PRICING': 'BILLING_PRICING',
    'TECHNOLOGY': 'TECHNOLOGY',
    'RESPONSIBLE_AI': 'RESPONSIBLE_AI',
    'AI_SERVICES': 'AI_SERVICES',
    'AI_FUNDAMENTALS': 'AI_FUNDAMENTALS',
    'ML_DEVELOPMENT': 'ML_DEVELOPMENT'
  };
  return mapping[domain] || domain;
}

async function generateSQL() {
  console.log('🔄 Gerando arquivos SQL separados...\n');

  for (const [cert, filePath] of Object.entries(CERT_FILES)) {
    try {
      const fileContent = readFileSync(join(process.cwd(), filePath), 'utf-8');
      const questions = JSON.parse(fileContent);

      let sql = '';
      sql += `-- ============================================================\n`;
      sql += `-- IMPORTAÇÃO DE QUESTÕES TRADUZIDAS - ${cert}\n`;
      sql += `-- Total: ${questions.length} questões\n`;
      sql += `-- ============================================================\n`;
      sql += `-- Instruções:\n`;
      sql += `-- 1. Abra o Supabase Dashboard\n`;
      sql += `-- 2. Vá para SQL Editor\n`;
      sql += `-- 3. Cole este arquivo completo\n`;
      sql += `-- 4. Clique em RUN\n`;
      sql += `-- ============================================================\n\n`;
      sql += `BEGIN;\n\n`;

      let count = 0;
      for (const q of questions) {
        const domain = normalizeDomain(q.domain || 'SECURE');
        const brId = `${q.id}-br`;

        // Converter correct_answers array em array PostgreSQL
        const correctAnswersArray = Array.isArray(q.correct_answers)
          ? `ARRAY[${q.correct_answers.map(a => `'${a}'`).join(', ')}]`
          : `ARRAY[]`;

        // Pegar primeira resposta correta para correct_answer (compatibilidade com schema antigo)
        const correctAnswer = Array.isArray(q.correct_answers) && q.correct_answers.length > 0
          ? q.correct_answers[0]
          : 'A';

        // Manter incorrect_explanations como JSONB
        const incorrectExplanations = q.incorrect_explanations
          ? `'${JSON.stringify(q.incorrect_explanations).replace(/'/g, "''")}'::jsonb`
          : `'{}'::jsonb`;

        // Usar DOLLAR QUOTING para evitar problemas com aspas
        const insertSql = `INSERT INTO public.questions (
  id,
  certification_id,
  domain,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_answer,
  correct_answers,
  required_selection_count,
  explanation_basic,
  explanation_detailed,
  incorrect_explanations,
  difficulty,
  tier,
  active,
  created_at,
  updated_at
) VALUES (
  '${brId}',
  '${cert}',
  '${domain}',
  $$${q.question_text || ''}$$,
  $$${q.option_a || ''}$$,
  $$${q.option_b || ''}$$,
  $$${q.option_c || ''}$$,
  $$${q.option_d || ''}$$,
  $$${q.option_e || ''}$$,
  '${correctAnswer}',
  ${correctAnswersArray},
  ${q.required_selection_count || 1},
  $$${q.explanation_basic || ''}$$,
  $$${q.explanation_detailed || ''}$$,
  ${incorrectExplanations},
  '${q.difficulty || 'medium'}',
  '${q.tier || 'FREE'}',
  ${q.active !== false ? 'true' : 'false'},
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;\n`;

        sql += insertSql;
        count++;
      }

      sql += `\nCOMMIT;\n\n`;
      sql += `-- ============================================================\n`;
      sql += `-- ✅ ${count} questões de ${cert} foram inseridas\n`;
      sql += `-- ============================================================\n`;

      // Salvar em arquivo separado
      const fileName = `insert-br-${cert}.sql`;
      writeFileSync(join(process.cwd(), 'scripts', fileName), sql);
      console.log(`✅ ${fileName} gerado com sucesso (${count} questões)`);

    } catch (error) {
      console.error(`❌ ERRO ao processar ${filePath}:`, error);
    }
  }

  console.log('\n🎉 Todos os arquivos foram gerados em scripts/');
  console.log('\n📋 Próximas etapas:');
  console.log('1. Vá até scripts/ e abra cada arquivo:');
  console.log('   - insert-br-SAA-C03.sql (primeiro)');
  console.log('   - insert-br-CLF-C02.sql (segundo)');
  console.log('   - insert-br-AIF-C01.sql (terceiro)');
  console.log('\n2. Para cada arquivo:');
  console.log('   - Abra Supabase Dashboard (https://app.supabase.com)');
  console.log('   - Vá para SQL Editor');
  console.log('   - Cole o conteúdo do arquivo');
  console.log('   - Clique em RUN');
  console.log('   - Aguarde a conclusão');
  console.log('\n3. Repita para os 3 arquivos');
}

generateSQL().catch(console.error);
