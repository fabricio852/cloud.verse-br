import { useEffect, useState } from 'react';
import { fetchQuestions, QuizFilters } from '../services/questionsService';
import type { Question as DBQuestion } from '../types/database';
import { Question, Domain } from '../types';
import { getBaseQuestionId } from '../utils';

// Converte registros do banco/JSON para formato da aplicação
function normalizeAnswers(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(/[,|;]+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
}

function convertDBQuestionToAppFormat(dbQuestion: DBQuestion): Question {
  const answerKey = normalizeAnswers(
    (dbQuestion as any).correct_answers ?? dbQuestion.correct_answer
  );

  const requiredSelectionsRaw =
    (dbQuestion as any).required_selection_count ?? (answerKey.length || 1);
  const requiredSelections = Math.max(
    1,
    Number.isFinite(requiredSelectionsRaw) ? Number(requiredSelectionsRaw) : 1
  );

  const options: Question['options'] = {
    A: dbQuestion.option_a,
    B: dbQuestion.option_b,
    C: dbQuestion.option_c,
    D: dbQuestion.option_d,
  };

  const optionE = (dbQuestion as any).option_e ?? (dbQuestion as any).option_5;
  if (optionE) {
    options.E = optionE;
  }

  return {
    id: dbQuestion.id,
    domain: dbQuestion.domain as Domain,
    stem: dbQuestion.question_text,
    options,
    answerKey: answerKey.length > 0 ? answerKey : [dbQuestion.correct_answer].filter(Boolean),
    requiredSelections,
    explanation_basic: dbQuestion.explanation_basic,
    explanation_detailed: dbQuestion.explanation_detailed,
    incorrect: dbQuestion.incorrect_explanations,
  };
}

interface UseQuestionsOptions {
  certificationId?: string;
  domains?: string[];
  tier?: 'FREE' | 'PRO' | 'ALL';
  limit?: number;
  enabled?: boolean;
  shuffle?: boolean;
  seed?: string;
  take?: number;
}

/**
 * Hook para buscar questões (PT-BR apenas). Força idioma PT-BR e não mantém cache bilíngue.
 */
export function useQuestions(options: UseQuestionsOptions = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    certificationId = 'SAA-C03',
    domains,
    tier = 'ALL',
    limit,
    enabled = true,
    shuffle = true,
    seed,
    take,
  } = options;

  const depsKey = JSON.stringify({
    certificationId,
    domains: domains?.join('|') || '',
    tier,
    limit,
    shuffle,
    seed,
    take,
  });

  useEffect(() => {
    if (!enabled) return;

    const loadQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseFilters: QuizFilters = {
          certificationId,
          domains,
          tier,
          limit,
          shuffle,
          seed,
          take,
        };

        const dbQuestions = await fetchQuestions(baseFilters);
        const appQuestions = dbQuestions.map(convertDBQuestionToAppFormat);
        setQuestions(appQuestions);
      } catch (err) {
        setError(err as Error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    void loadQuestions();
  }, [depsKey, enabled]);

  return { questions, loading, error };
}
