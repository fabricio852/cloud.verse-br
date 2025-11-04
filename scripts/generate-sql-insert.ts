/**
 * Gera script SQL INSERT para importar no Supabase
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const filePath = process.argv[2] || 'data/custom-questions.json';
const fullPath = join(process.cwd(), filePath);

console.log('🔧 Gerando SQL INSERT...\n');

interface CustomQuestion {
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  multiSelect: boolean;
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function extractAnswerLetter(answer: string | string[]): string {
  if (Array.isArray(answer)) {
    return answer[0].trim().charAt(0);
  }
  return answer.trim().charAt(0);
}

function cleanOption(option: string): string {
  return option.replace(/^[A-D]\.\s*/, '').trim();
}

try {
  const content = readFileSync(fullPath, 'utf-8');
  const questions: CustomQuestion[] = JSON.parse(content);

  let sql = `-- ============================================
-- IMPORTAÇÃO DE QUESTÕES
-- Gerado automaticamente
-- ============================================

BEGIN;

`;

  questions.forEach((q, index) => {
    const id = `saa-secure-${String(index + 1).padStart(3, '0')}`;
    const questionText = escapeSQL(q.question);
    const optionA = escapeSQL(cleanOption(q.options[0] || ''));
    const optionB = escapeSQL(cleanOption(q.options[1] || ''));
    const optionC = escapeSQL(cleanOption(q.options[2] || ''));
    const optionD = escapeSQL(cleanOption(q.options[3] || ''));
    const correctLetter = extractAnswerLetter(q.correctAnswer);
    const explanation = escapeSQL(q.explanation);

    // Explicações incorretas
    const incorrectExplanations: any = {};
    ['A', 'B', 'C', 'D'].forEach(letter => {
      if (letter !== correctLetter) {
        incorrectExplanations[letter] = 'Esta opção não atende completamente aos requisitos da questão.';
      }
    });

    const incorrectJson = JSON.stringify(incorrectExplanations).replace(/'/g, "''");

    sql += `INSERT INTO questions (
  id, certification_id, domain,
  question_text, option_a, option_b, option_c, option_d,
  correct_answer, explanation_basic, explanation_detailed,
  incorrect_explanations, tags, difficulty, tier, active
) VALUES (
  '${id}',
  'SAA-C03',
  'SECURE',
  '${questionText}',
  '${optionA}',
  '${optionB}',
  '${optionC}',
  '${optionD}',
  '${correctLetter}',
  '${explanation}',
  '${explanation}${q.multiSelect ? ' (Questão de múltipla escolha)' : ''}',
  '${incorrectJson}'::jsonb,
  ARRAY['AWS']::text[],
  'medium',
  'FREE',
  true
) ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  option_a = EXCLUDED.option_a,
  option_b = EXCLUDED.option_b,
  option_c = EXCLUDED.option_c,
  option_d = EXCLUDED.option_d,
  correct_answer = EXCLUDED.correct_answer,
  explanation_basic = EXCLUDED.explanation_basic,
  explanation_detailed = EXCLUDED.explanation_detailed,
  incorrect_explanations = EXCLUDED.incorrect_explanations,
  updated_at = NOW();

`;
  });

  sql += `
COMMIT;

-- ============================================
-- ${questions.length} questões importadas!
-- ============================================
`;

  const outputPath = join(process.cwd(), 'supabase', 'insert-questions.sql');
  writeFileSync(outputPath, sql, 'utf-8');

  console.log('✅ Arquivo SQL gerado!');
  console.log(`📂 Local: supabase/insert-questions.sql`);
  console.log(`📊 ${questions.length} questões`);
  console.log('\n📝 Próximos passos:');
  console.log('1. Acesse o Supabase Dashboard');
  console.log('2. Vá em SQL Editor');
  console.log('3. Cole o conteúdo de supabase/insert-questions.sql');
  console.log('4. Clique em "Run"');
  console.log('\n✨ Pronto!');
} catch (error: any) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
