/**
 * Serviço para gerenciar questões do quiz
 */

import type { Database } from '../types/database';
import { seededShuffle, shuffle, getBaseQuestionId } from '../utils';
import { supabase } from './supabaseClient';
import saaQuestionsBR from '../data/saa-questions-br.json' assert { type: 'json' };
import clfQuestionsBR from '../data/clf-questions-br.json' assert { type: 'json' };
import aifQuestionsBR from '../data/aif-questions-br.json' assert { type: 'json' };
import dvaQuestionsBR from '../data/dva-questions-br.json' assert { type: 'json' };
// dvaQuestionsEN existe em data/dva-questions.json mas não é usado neste app (apenas para Supabase/outro app)

type Question = Database['public']['Tables']['questions']['Row'];

// Mapeamento de certifications para arquivos JSON
const BR_QUESTIONS_FILES: Record<string, string> = {
  'SAA-C03': '/data/saa-questions-br.json',
  'CLF-C02': '/data/clf-questions-br.json',
  'AIF-C01': '/data/aif-questions-br.json',
  'DVA-C02': '/data/dva-questions-br.json',
};

/**
 * Carrega questões em PT-BR de arquivo JSON local como fallback
 * Questões EN do DVA-C02 existem no arquivo mas são apenas para exportar ao Supabase (outro app)
 * Usado quando as questões não estão disponíveis no banco de dados
 */
async function loadBRQuestionsFromJSON(certificationId: string): Promise<Question[]> {
  // Primeiro tenta usar dados importados no bundle (funciona em dev e build)
  let rawQuestions: any[] | null = null;
  if (certificationId === 'SAA-C03') rawQuestions = saaQuestionsBR as any[];
  if (certificationId === 'CLF-C02') rawQuestions = clfQuestionsBR as any[];
  if (certificationId === 'AIF-C01') rawQuestions = aifQuestionsBR as any[];
  if (certificationId === 'DVA-C02') {
    // Para DVA-C02, usar apenas PT-BR (EN vai para Supabase para outro app)
    rawQuestions = dvaQuestionsBR as any[];
  }

  // Se não houver no bundle, tenta fetch do arquivo na pasta data (apenas build)
  if (!rawQuestions) {
    const filePath = BR_QUESTIONS_FILES[certificationId];
    if (!filePath) {
      throw new Error(`Certificação desconhecida: ${certificationId}`);
    }

    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Não foi possível carregar ${filePath}: ${response.statusText}`);
    }

    rawQuestions = await response.json();
  }

  if (!rawQuestions) {
    throw new Error(`Não foi possível carregar questões BR para ${certificationId}`);
  }

    // Mapeia questões do arquivo JSON para o formato esperado pela app
    // Adiciona sufixo -br aos IDs para manter consistência com banco de dados
  const brQuestions: Question[] = rawQuestions.map((q: any) => {
    // Mapear SECURITY -> DVA_SECURITY para DVA-C02
    let domain = q.domain;
    if (certificationId === 'DVA-C02' && domain === 'SECURITY') {
      domain = 'DVA_SECURITY';
    }

    // Adicionar sufixo -br se não tiver
    const questionId = q.id.endsWith('-br') ? q.id : `${q.id}-br`;

    return {
      id: questionId,
      certification_id: certificationId,
      domain: domain,
    difficulty: q.difficulty,
    tier: q.tier || 'FREE',
    active: q.active !== false,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    option_e: q.option_e,
    correct_answers: q.correct_answers,
    required_selection_count: q.required_selection_count || 1,
    explanation_detailed: q.explanation_detailed,
    explanation_basic: q.explanation_basic,
    incorrect_explanations: q.incorrect_explanations,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    };
  });

  return brQuestions;
}

const DOMAIN_MAP: Record<string, Record<string, string>> = {
  'SAA-C03': {
    SECURE: 'DESIGN_SECURE_APPLICATIONS_ARCHITECTURES',
    RESILIENT: 'DESIGN_RESILIENT_ARCHITECTURES',
    PERFORMANCE: 'DESIGN_HIGH_PERFORMING_ARCHITECTURES',
    COST: 'DESIGN_COST_OPTIMIZED_ARCHITECTURES',
  },
  'DVA-C02': {
    SECURITY: 'DVA_SECURITY',
  },
};

/**
 * Aplica filtros client-side às questões carregadas do JSON
 */
function applyFiltersToQuestions(questions: Question[], filters: QuizFilters): Question[] {
  let filtered = [...questions];

  // Filtro de domínios
  if (filters.domains && filters.domains.length > 0) {
    const map = DOMAIN_MAP[filters.certificationId] || {};
    const desired = new Set(
      filters.domains.flatMap((d) => {
        const mapped = map[d];
        return mapped ? [d, mapped] : [d];
      })
    );
    filtered = filtered.filter(q => desired.has(q.domain));
  }

  // Filtro de dificuldade
  if (filters.difficulty && filters.difficulty.length > 0) {
    filtered = filtered.filter(q => filters.difficulty!.includes(q.difficulty as 'easy' | 'medium' | 'hard'));
  }

  // Filtro de tier (FREE vs PRO)
  if (filters.tier && filters.tier !== 'ALL') {
    filtered = filtered.filter(q => q.tier === filters.tier);
  }

  return filtered;
}

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
 * Busca questões em PT-BR usando apenas os JSONs locais.
 * Questões EN do DVA-C02 são apenas para Supabase (outro app).
 * Ignora Supabase.
 */
export async function fetchQuestions(filters: QuizFilters): Promise<Question[]> {
  const brQuestionsRaw = await loadBRQuestionsFromJSON(filters.certificationId);

  // Filtrar apenas questões PT-BR (com sufixo -br)
  const onlyBr = brQuestionsRaw.filter((q) => q.id.toLowerCase().endsWith('-br'));

  const filtered = applyFiltersToQuestions(onlyBr, filters);

  let results = filtered.sort((a, b) => {
    const baseA = getBaseQuestionId(a.id);
    const baseB = getBaseQuestionId(b.id);
    if (baseA === baseB) return a.id.localeCompare(b.id);
    return baseA.localeCompare(baseB);
  });

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
