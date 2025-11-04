import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  createQuizAttempt,
  saveUserAnswer,
  completeQuizAttempt,
} from '../services/questionsService';
import type { Question, DomainStats } from '../types';

type QuizType = 'daily' | 'full' | 'practice' | 'domains' | 'review';

interface UseQuizAttemptOptions {
  certificationId: string;
  quizType: QuizType;
  totalQuestions: number;
  timeLimit?: number;
  questions: Question[];
}

/**
 * Hook para gerenciar tentativas de quiz com persistência no Supabase
 */
export function useQuizAttempt(options: UseQuizAttemptOptions) {
  const { user } = useAuthStore();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const questionTimers = useRef<Map<number, number>>(new Map());
  const attemptStartTime = useRef<number>(Date.now());

  /**
   * Inicia uma nova tentativa de quiz
   */
  const startAttempt = useCallback(async () => {
    if (!user) {
      console.warn('[useQuizAttempt] Sem usuário autenticado - pulando salvamento');
      return null;
    }

    if (options.questions.length === 0) {
      console.warn('[useQuizAttempt] Sem questões - pulando criação de attempt');
      return null;
    }

    try {
      const attempt = await createQuizAttempt({
        userId: user.id,
        certificationId: options.certificationId,
        quizType: options.quizType,
        totalQuestions: options.totalQuestions,
        timeLimit: options.timeLimit,
      });

      if (attempt) {
        setAttemptId(attempt.id);
        attemptStartTime.current = Date.now();
        console.log('[useQuizAttempt] Tentativa criada:', attempt.id);
        return attempt.id;
      }

      return null;
    } catch (error) {
      console.error('[useQuizAttempt] Erro ao criar tentativa:', error);
      return null;
    }
  }, [user, options.certificationId, options.quizType, options.totalQuestions, options.timeLimit, options.questions.length]);

  /**
   * Inicia o timer para uma questão
   */
  const startQuestionTimer = useCallback((questionIndex: number) => {
    questionTimers.current.set(questionIndex, Date.now());
  }, []);

  /**
   * Salva uma resposta do usuário
   */
  const recordAnswer = useCallback(async (
    questionIndex: number,
    selectedAnswer: string,
    isCorrect: boolean
  ) => {
    if (!attemptId || !user) {
      console.warn('[useQuizAttempt] Sem attempt/usuário - pulando salvamento de resposta');
      return;
    }

    const question = options.questions[questionIndex];
    if (!question) {
      console.error('[useQuizAttempt] Questão não encontrada:', questionIndex);
      return;
    }

    // Calcular tempo gasto na questão
    const startTime = questionTimers.current.get(questionIndex) || Date.now();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      setIsSaving(true);

      await saveUserAnswer({
        attemptId,
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        timeSpentSeconds: timeSpent,
      });

      console.log(`[useQuizAttempt] Resposta salva: Q${questionIndex + 1} - ${selectedAnswer} (${isCorrect ? 'CORRETA' : 'INCORRETA'})`);
    } catch (error) {
      console.error('[useQuizAttempt] Erro ao salvar resposta:', error);
    } finally {
      setIsSaving(false);
    }
  }, [attemptId, user, options.questions]);

  /**
   * Finaliza a tentativa de quiz
   */
  const finishAttempt = useCallback(async (
    correctAnswers: number,
    domainBreakdown: {
      byDomainCorrect: DomainStats;
      byDomainTotal: DomainStats;
    }
  ) => {
    if (!attemptId || !user) {
      console.warn('[useQuizAttempt] Sem attempt/usuário - pulando finalização');
      return true; // Retorna true para não bloquear o fluxo
    }

    // Calcular score (padrão AWS: 100-1000)
    const accuracy = correctAnswers / options.totalQuestions;
    const score = 100 + Math.round(accuracy * 900);

    try {
      setIsSaving(true);

      const success = await completeQuizAttempt({
        attemptId,
        correctAnswers,
        score,
        domainBreakdown: {
          SECURE: {
            correct: domainBreakdown.byDomainCorrect.SECURE,
            total: domainBreakdown.byDomainTotal.SECURE,
          },
          RESILIENT: {
            correct: domainBreakdown.byDomainCorrect.RESILIENT,
            total: domainBreakdown.byDomainTotal.RESILIENT,
          },
          PERFORMANCE: {
            correct: domainBreakdown.byDomainCorrect.PERFORMANCE,
            total: domainBreakdown.byDomainTotal.PERFORMANCE,
          },
          COST: {
            correct: domainBreakdown.byDomainCorrect.COST,
            total: domainBreakdown.byDomainTotal.COST,
          },
        },
      });

      if (success) {
        console.log('[useQuizAttempt] Tentativa finalizada:', {
          attemptId,
          correctAnswers,
          total: options.totalQuestions,
          score,
        });
      }

      return success;
    } catch (error) {
      console.error('[useQuizAttempt] Erro ao finalizar tentativa:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [attemptId, user, options.totalQuestions]);

  return {
    attemptId,
    isSaving,
    startAttempt,
    startQuestionTimer,
    recordAnswer,
    finishAttempt,
  };
}
