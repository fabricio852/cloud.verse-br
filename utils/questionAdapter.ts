/**
 * Adaptador para converter questões entre o formato Supabase e o formato local
 */

import type { Question as DBQuestion } from '../types/database';
import type { Question as LocalQuestion, Domain } from '../types';

function normalizeAnswers(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((value) => String(value).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split(/[,|;]+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Converte uma questão do Supabase para o formato local esperado pelo QuizScreen
 */
export function adaptQuestion(dbQuestion: DBQuestion): LocalQuestion {
  const parsedAnswers = normalizeAnswers(
    (dbQuestion as any).correct_answers ?? dbQuestion.correct_answer
  );

  const requiredSelectionsRaw =
    (dbQuestion as any).required_selection_count ?? parsedAnswers.length || 1;
  const requiredSelections = Math.max(
    1,
    Number.isFinite(requiredSelectionsRaw)
      ? Number(requiredSelectionsRaw)
      : parsedAnswers.length || 1
  );

  const options: LocalQuestion['options'] = {
    A: dbQuestion.option_a,
    B: dbQuestion.option_b,
    C: dbQuestion.option_c,
    D: dbQuestion.option_d,
  };

  const optionE = (dbQuestion as any).option_e ?? null;
  if (optionE) {
    options.E = optionE;
  }

  const incorrectEntries = dbQuestion.incorrect_explanations || {};
  const incorrect: Record<string, string> = {};
  Object.entries(incorrectEntries).forEach(([key, value]) => {
    if (value) incorrect[key] = value;
  });

  const answerKey =
    parsedAnswers.length > 0
      ? parsedAnswers
      : normalizeAnswers(dbQuestion.correct_answer);

  return {
    id: dbQuestion.id,
    domain: dbQuestion.domain as Domain,
    stem: dbQuestion.question_text,
    options,
    answerKey: answerKey.length > 0 ? answerKey : ['A'],
    requiredSelections,
    explanation_detailed: dbQuestion.explanation_detailed,
    explanation_basic: dbQuestion.explanation_basic,
    incorrect,
  };
}

/**
 * Converte múltiplas questões
 */
export function adaptQuestions(dbQuestions: DBQuestion[]): LocalQuestion[] {
  return dbQuestions.map(adaptQuestion);
}

/**
 * Converte uma questão local para o formato do Supabase (para upload)
 */
export function toDBQuestion(
  localQuestion: LocalQuestion,
  certificationId: string,
  tier: 'FREE' | 'PRO' = 'FREE',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Omit<DBQuestion, 'created_at' | 'updated_at' | 'active'> {
  const correctAnswers = localQuestion.answerKey ?? [];

  return {
    id: localQuestion.id,
    certification_id: certificationId,
    domain: localQuestion.domain,
    question_text: localQuestion.stem,
    option_a: localQuestion.options.A,
    option_b: localQuestion.options.B,
    option_c: localQuestion.options.C,
    option_d: localQuestion.options.D,
    option_e: localQuestion.options.E ?? null,
    correct_answer: correctAnswers[0] ?? '',
    correct_answers: correctAnswers,
    required_selection_count: localQuestion.requiredSelections,
    explanation_basic: localQuestion.explanation_basic || '',
    explanation_detailed: localQuestion.explanation_detailed,
    incorrect_explanations: localQuestion.incorrect || {},
    tags: [],
    difficulty,
    tier,
  };
}
