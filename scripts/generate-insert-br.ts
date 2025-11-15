/**
 * Script para gerar INSERT SQL das questões traduzidas
 * Copia o output e cola no Supabase SQL Editor
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const CERT_FILES: Record<string, string> = {
  'SAA-C03': 'data/saa-questions-br.json',
  'CLF-C02': 'data/clf-questions-br.json',
  'AIF-C01': 'data/aif-questions-br.json'
};

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
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
  console.log('-- ============================================================');
  console.log('-- IMPORTAÇÃO DE QUESTÕES TRADUZIDAS (PT-BR)');
  console.log('-- Cole este script no Supabase SQL Editor');
  console.log('-- ============================================================\n');

  for (const [cert, filePath] of Object.entries(CERT_FILES)) {
    try {
      const fileContent = readFileSync(join(process.cwd(), filePath), 'utf-8');
      const questions = JSON.parse(fileContent);

      console.log(`-- ============================================================`);
      console.log(`-- ${cert} (${questions.length} questões)`);
      console.log(`-- ============================================================`);
      console.log(`BEGIN;\n`);

      let count = 0;
      for (const q of questions) {
        const domain = normalizeDomain(q.domain || 'SECURE');
        const brId = `${q.id}-br`;

        const sql = `INSERT INTO public.questions (
  id,
  certification_id,
  domain,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
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
  '${escapeSql(brId)}',
  '${escapeSql(cert)}',
  '${escapeSql(domain)}',
  '${escapeSql(q.question_text || '')}',
  '${escapeSql(q.option_a || '')}',
  '${escapeSql(q.option_b || '')}',
  '${escapeSql(q.option_c || '')}',
  '${escapeSql(q.option_d || '')}',
  '${escapeSql(q.option_e || '')}',
  '${JSON.stringify(q.correct_answers || []).replace(/'/g, "''")}'::jsonb,
  ${q.required_selection_count || 1},
  '${escapeSql(q.explanation_basic || '')}',
  '${escapeSql(q.explanation_detailed || '')}',
  '${JSON.stringify(q.incorrect_explanations || {}).replace(/'/g, "''")}'::jsonb,
  '${escapeSql(q.difficulty || 'medium')}',
  '${escapeSql(q.tier || 'FREE')}',
  ${q.active !== false ? 'true' : 'false'},
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;`;

        console.log(sql);
        count++;
      }

      console.log(`\nCOMMIT;\n`);
      console.log(`-- ${count} questões inseridas para ${cert}\n`);

    } catch (error) {
      console.error(`-- ERRO ao processar ${filePath}:`, error);
    }
  }

  console.log('-- ============================================================');
  console.log('-- FIM DO SCRIPT');
  console.log('-- ============================================================');
}

generateSQL().catch(console.error);
