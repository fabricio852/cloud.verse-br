/**
 * Transforma questões SAA de um formato para outro
 * De: { question_text, option_a, option_b, option_c, option_d, option_e, correct_answers, ... }
 * Para: { question, options, correctAnswer, explanation, multiSelect }
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface SourceQuestion {
  id: string;
  certification_id: string;
  domain: string;
  difficulty: string;
  tier: string;
  required_selection_count: number;
  active: boolean;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string;
  correct_answers: string[];
  explanation_detailed: string;
  incorrect_explanations?: Record<string, string>;
}

interface TargetQuestion {
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  multiSelect: boolean;
  incorrect_explanations?: Record<string, string>;
}

const inputFile = process.argv[2] || 'data/saa-questions.json';
const outputFile = process.argv[3] || 'data/saa-questions-converted.json';

console.log(`📖 Lendo arquivo: ${inputFile}`);
const fileContent = readFileSync(join(process.cwd(), inputFile), 'utf-8');
const sourceQuestions: SourceQuestion[] = JSON.parse(fileContent);

console.log(`✅ ${sourceQuestions.length} questões carregadas\n`);

const converted: TargetQuestion[] = sourceQuestions.map((q) => {
  // Montar array de opções (A, B, C, D, e opcionalmente E)
  const options = [q.option_a, q.option_b, q.option_c, q.option_d];
  if (q.option_e) {
    options.push(q.option_e);
  }

  // Resposta correta
  const correctAnswers = q.correct_answers;
  const correctAnswer = correctAnswers.length === 1 ? correctAnswers[0] : correctAnswers;

  // É múltipla escolha?
  const multiSelect = q.required_selection_count > 1 || correctAnswers.length > 1;

  const result: TargetQuestion = {
    question: q.question_text,
    options,
    correctAnswer,
    explanation: q.explanation_detailed,
    multiSelect
  };

  // Incluir explicações das respostas incorretas se disponíveis
  if (q.incorrect_explanations && Object.keys(q.incorrect_explanations).length > 0) {
    result.incorrect_explanations = q.incorrect_explanations;
  }

  return result;
});

console.log('📝 Escrevendo arquivo convertido...');
writeFileSync(join(process.cwd(), outputFile), JSON.stringify(converted, null, 2));

console.log(`\n✅ Conversão concluída!`);
console.log(`📄 Arquivo salvo em: ${outputFile}`);
console.log(`\nPróximo passo: npm run import-custom -- --file=${outputFile} --cert=SAA-C03`);
