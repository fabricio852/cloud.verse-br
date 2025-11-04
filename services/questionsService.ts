/**
 * Serviço para gerenciar questões do quiz
 */

import { supabase } from './supabaseClient';
import type { Database } from '../types/database';
import { seededShuffle, shuffle } from '../utils';

type Question = Database['public']['Tables']['questions']['Row'];
type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];
type UserAnswer = Database['public']['Tables']['user_answers']['Row'];

export interface QuizFilters {
  certificationId: string;
  domains?: string[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  tier?: 'FREE' | 'PRO' | 'ALL';
  limit?: number;
  excludeAnswered?: boolean;
  shuffle?: boolean;
  seed?: string;
  take?: number;
}

/**
 * Busca questões do banco com filtros
 */
export async function fetchQuestions(filters: QuizFilters): Promise<Question[]> {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('certification_id', filters.certificationId)
    .eq('active', true);

  // Filtro de domínios
  if (filters.domains && filters.domains.length > 0) {
    query = query.in('domain', filters.domains);
  }

  // Filtro de dificuldade
  if (filters.difficulty && filters.difficulty.length > 0) {
    query = query.in('difficulty', filters.difficulty);
  }

  // Filtro de tier (FREE vs PRO)
  if (filters.tier && filters.tier !== 'ALL') {
    query = query.eq('tier', filters.tier);
  }

  // Limite de questões
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if ((filters.seed || filters.shuffle === false) && !filters.excludeAnswered) {
    query = query.order('id', { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error('[questionsService] Erro ao buscar questões:', error);
    throw error;
  }

  let results = data || [];

  if (!filters.excludeAnswered) {
    if (filters.seed) {
      results = seededShuffle(results, filters.seed);
    } else if (filters.shuffle !== false) {
      results = shuffle(results);
    }
  }

  if (filters.take && results.length > filters.take) {
    results = results.slice(0, filters.take);
  } else if (filters.limit && results.length > filters.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Busca uma questão específica por ID
 */
export async function fetchQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`[questionsService] Erro ao buscar questão ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * Cria uma nova tentativa de quiz
 */
export async function createQuizAttempt(params: {
  userId: string;
  certificationId: string;
  quizType: 'daily' | 'full' | 'practice' | 'domains' | 'review';
  totalQuestions: number;
  timeLimit?: number;
}): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: params.userId,
      certification_id: params.certificationId,
      quiz_type: params.quizType,
      questions_count: params.totalQuestions,
      time_limit_seconds: params.timeLimit || null,
      questions_answered: 0,
      correct_answers: 0,
      score: 0,
      domain_breakdown: {
        SECURE: { correct: 0, total: 0 },
        RESILIENT: { correct: 0, total: 0 },
        PERFORMANCE: { correct: 0, total: 0 },
        COST: { correct: 0, total: 0 },
      },
    })
    .select()
    .single();

  if (error) {
    console.error('[questionsService] Erro ao criar quiz attempt:', error);
    return null;
  }

  return data;
}

/**
 * Salva uma resposta do usuário
 */
export async function saveUserAnswer(params: {
  attemptId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}): Promise<boolean> {
  // Buscar o user_id do attempt
  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select('user_id')
    .eq('id', params.attemptId)
    .single();

  if (!attempt) {
    console.error('[questionsService] Attempt não encontrado:', params.attemptId);
    return false;
  }

  const { error } = await supabase
    .from('user_answers')
    .upsert({
      user_id: attempt.user_id,
      quiz_attempt_id: params.attemptId,
      question_id: params.questionId,
      selected_answer: params.selectedAnswer,
      is_correct: params.isCorrect,
      time_spent_seconds: params.timeSpentSeconds,
      marked_for_review: false,
    });

  if (error) {
    console.error('[questionsService] Erro ao salvar resposta:', error);
    return false;
  }

  return true;
}

/**
 * Finaliza uma tentativa de quiz
 */
export async function completeQuizAttempt(params: {
  attemptId: string;
  correctAnswers: number;
  score: number;
  domainBreakdown: Record<string, { correct: number; total: number }>;
}): Promise<boolean> {
  // Contar quantas questões foram respondidas
  const { count } = await supabase
    .from('user_answers')
    .select('*', { count: 'exact', head: true })
    .eq('quiz_attempt_id', params.attemptId);

  const questionsAnswered = count || 0;

  const { error } = await supabase
    .from('quiz_attempts')
    .update({
      questions_answered: questionsAnswered,
      correct_answers: params.correctAnswers,
      score: params.score,
      domain_breakdown: params.domainBreakdown,
      completed_at: new Date().toISOString(),
    })
    .eq('id', params.attemptId);

  if (error) {
    console.error('[questionsService] Erro ao finalizar quiz:', error);
    return false;
  }

  return true;
}

/**
 * Busca histórico de tentativas do usuário
 */
export async function fetchUserAttempts(
  userId: string,
  certificationId?: string
): Promise<QuizAttempt[]> {
  let query = supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (certificationId) {
    query = query.eq('certification_id', certificationId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[questionsService] Erro ao buscar attempts:', error);
    return [];
  }

  return data || [];
}

/**
 * Busca respostas de uma tentativa específica
 */
export async function fetchAttemptAnswers(attemptId: string): Promise<UserAnswer[]> {
  const { data, error } = await supabase
    .from('user_answers')
    .select('*')
    .eq('attempt_id', attemptId)
    .order('answered_at', { ascending: true });

  if (error) {
    console.error('[questionsService] Erro ao buscar respostas:', error);
    return [];
  }

  return data || [];
}

/**
 * Incrementa contador de vezes que a questão foi respondida
 */
export async function incrementQuestionStats(
  questionId: string,
  wasCorrect: boolean
): Promise<void> {
  const { error } = await supabase.rpc('increment_question_stats', {
    question_id: questionId,
    was_correct: wasCorrect
  });

  if (error) {
    // Fallback manual se a function não existir
    const { data: question } = await supabase
      .from('questions')
      .select('times_answered, times_correct')
      .eq('id', questionId)
      .single();

    if (question) {
      await supabase
        .from('questions')
        .update({
          times_answered: question.times_answered + 1,
          times_correct: wasCorrect ? question.times_correct + 1 : question.times_correct
        })
        .eq('id', questionId);
    }
  }
}
