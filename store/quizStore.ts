/**
 * Store Zustand para gerenciar estado do Quiz
 */

import { create } from 'zustand';
import type { Database } from '../types/database';
import {
  fetchQuestions,
  createQuizAttempt,
  saveUserAnswer,
  completeQuizAttempt,
  incrementQuestionStats,
  type QuizFilters
} from '../services/questionsService';

type Question = Database['public']['Tables']['questions']['Row'];
type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];

interface UserAnswer {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timeSpentSeconds: number;
}

interface QuizState {
  // Estado do quiz
  questions: Question[];
  currentIndex: number;
  answers: UserAnswer[];
  attempt: QuizAttempt | null;
  isLoading: boolean;
  error: string | null;

  // Estatísticas
  correctCount: number;
  totalAnswered: number;

  // Tempo
  startTime: Date | null;
  timeSpentOnQuestion: number;

  // Ações
  startQuiz: (userId: string, filters: QuizFilters, mode?: 'study' | 'timed' | 'full_exam', timeLimit?: number) => Promise<boolean>;
  answerQuestion: (questionId: string, selectedAnswer: 'A' | 'B' | 'C' | 'D', correctAnswer: 'A' | 'B' | 'C' | 'D') => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  finishQuiz: () => Promise<{ score: number; correct: number; total: number }>;
  resetQuiz: () => void;

  // Helpers
  getCurrentQuestion: () => Question | null;
  getQuestionAnswer: (questionId: string) => UserAnswer | undefined;
  isQuestionAnswered: (questionId: string) => boolean;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Estado inicial
  questions: [],
  currentIndex: 0,
  answers: [],
  attempt: null,
  isLoading: false,
  error: null,
  correctCount: 0,
  totalAnswered: 0,
  startTime: null,
  timeSpentOnQuestion: 0,

  /**
   * Inicia um novo quiz
   */
  startQuiz: async (userId, filters, mode = 'study', timeLimit) => {
    set({ isLoading: true, error: null });

    try {
      // Buscar questões
      const questions = await fetchQuestions(filters);

      if (questions.length === 0) {
        set({ error: 'Nenhuma questão encontrada com os filtros selecionados', isLoading: false });
        return false;
      }

      // Criar tentativa no banco
      const attempt = await createQuizAttempt({
        userId,
        certificationId: filters.certificationId,
        mode,
        domains: filters.domains,
        totalQuestions: questions.length,
        timeLimit,
      });

      if (!attempt) {
        set({ error: 'Erro ao criar tentativa de quiz', isLoading: false });
        return false;
      }

      // Configurar estado
      set({
        questions,
        attempt,
        currentIndex: 0,
        answers: [],
        correctCount: 0,
        totalAnswered: 0,
        startTime: new Date(),
        timeSpentOnQuestion: 0,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error('[quizStore] Erro ao iniciar quiz:', error);
      set({ error: 'Erro ao carregar quiz', isLoading: false });
      return false;
    }
  },

  /**
   * Responde uma questão
   */
  answerQuestion: async (questionId, selectedAnswer, correctAnswer) => {
    const { attempt, answers, timeSpentOnQuestion } = get();

    if (!attempt) {
      console.error('[quizStore] Tentativa não encontrada');
      return;
    }

    const isCorrect = selectedAnswer === correctAnswer;
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);

    // Atualizar ou adicionar resposta
    let newAnswers: UserAnswer[];
    let wasFirstAnswer = false;

    if (existingAnswerIndex >= 0) {
      // Atualizar resposta existente
      newAnswers = [...answers];
      const wasCorrectBefore = newAnswers[existingAnswerIndex].isCorrect;
      newAnswers[existingAnswerIndex] = {
        questionId,
        selectedAnswer,
        isCorrect,
        timeSpentSeconds: timeSpentOnQuestion,
      };

      // Ajustar contador de acertos
      if (wasCorrectBefore && !isCorrect) {
        set({ correctCount: get().correctCount - 1 });
      } else if (!wasCorrectBefore && isCorrect) {
        set({ correctCount: get().correctCount + 1 });
      }
    } else {
      // Nova resposta
      wasFirstAnswer = true;
      newAnswers = [
        ...answers,
        {
          questionId,
          selectedAnswer,
          isCorrect,
          timeSpentSeconds: timeSpentOnQuestion,
        },
      ];

      set({
        totalAnswered: get().totalAnswered + 1,
        correctCount: isCorrect ? get().correctCount + 1 : get().correctCount,
      });
    }

    set({ answers: newAnswers, timeSpentOnQuestion: 0 });

    // Salvar no banco (async, não bloqueia UI)
    saveUserAnswer({
      attemptId: attempt.id,
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpentSeconds: timeSpentOnQuestion,
    }).catch(error => {
      console.error('[quizStore] Erro ao salvar resposta:', error);
    });

    // Atualizar estatísticas da questão (somente na primeira vez)
    if (wasFirstAnswer) {
      incrementQuestionStats(questionId, isCorrect).catch(error => {
        console.error('[quizStore] Erro ao atualizar stats:', error);
      });
    }
  },

  /**
   * Avança para próxima questão
   */
  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, timeSpentOnQuestion: 0 });
    }
  },

  /**
   * Volta para questão anterior
   */
  previousQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, timeSpentOnQuestion: 0 });
    }
  },

  /**
   * Vai para questão específica
   */
  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index, timeSpentOnQuestion: 0 });
    }
  },

  /**
   * Finaliza o quiz
   */
  finishQuiz: async () => {
    const { attempt, questions, correctCount, totalAnswered } = get();

    if (!attempt) {
      return { score: 0, correct: 0, total: 0 };
    }

    // Calcular score (formato AWS: 100-1000)
    const percentage = totalAnswered > 0 ? correctCount / totalAnswered : 0;
    const score = Math.round(100 + percentage * 900);

    // Salvar no banco
    await completeQuizAttempt({
      attemptId: attempt.id,
      correctAnswers: correctCount,
      score,
    }).catch(error => {
      console.error('[quizStore] Erro ao finalizar quiz:', error);
    });

    return {
      score,
      correct: correctCount,
      total: questions.length,
    };
  },

  /**
   * Reseta o quiz
   */
  resetQuiz: () => {
    set({
      questions: [],
      currentIndex: 0,
      answers: [],
      attempt: null,
      isLoading: false,
      error: null,
      correctCount: 0,
      totalAnswered: 0,
      startTime: null,
      timeSpentOnQuestion: 0,
    });
  },

  /**
   * Retorna a questão atual
   */
  getCurrentQuestion: () => {
    const { questions, currentIndex } = get();
    return questions[currentIndex] || null;
  },

  /**
   * Retorna a resposta de uma questão
   */
  getQuestionAnswer: (questionId) => {
    const { answers } = get();
    return answers.find(a => a.questionId === questionId);
  },

  /**
   * Verifica se uma questão foi respondida
   */
  isQuestionAnswered: (questionId) => {
    const { answers } = get();
    return answers.some(a => a.questionId === questionId);
  },
}));
