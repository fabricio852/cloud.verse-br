import { useState, useEffect } from 'react';
import { fetchQuestions, QuizFilters } from '../services/questionsService';
import type { Question as DBQuestion } from '../types/database';
import { Question, Domain } from '../types';
import { useLanguageStore } from '../stores/languageStore';
import { getBaseQuestionId } from '../utils';

/**
 * Converte questão do formato Supabase para o formato da aplicação
 */
function normalizeAnswers(raw: unknown): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }

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
    Number.isFinite(requiredSelectionsRaw)
      ? Number(requiredSelectionsRaw)
      : 1
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
  preloadBoth?: boolean; // busca EN e PT-BR e mantém cache para troca instantânea
  anchorLanguage?: 'en' | 'pt-BR'; // idioma base para ordenação (default: en)
}

/**
 * Hook para buscar questões do Supabase com suporte a cache bilíngue
 */
export function useQuestions(options: UseQuestionsOptions = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [bilingualCache, setBilingualCache] = useState<{ ['en']: Question[]; ['pt-BR']: Question[] } | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  const language = useLanguageStore((state) => state.language);

  const {
    certificationId = 'SAA-C03',
    domains,
    tier = 'ALL',
    limit,
    enabled = true,
    shuffle = true,
    seed,
    take,
    preloadBoth = false,
    anchorLanguage = 'en',
  } = options;

  // Chave de dependência para identificar o dataset (exclui idioma)
  const depsKey = JSON.stringify({
    certificationId,
    domains: domains?.join('|') || '',
    tier,
    limit,
    shuffle,
    seed,
    take,
    preloadBoth,
    anchorLanguage,
  });

  useEffect(() => {
    if (!enabled) {
      console.log('[useQuestions] Hook desabilitado - pulando busca');
      return;
    }

    const loadQuestions = async () => {
      console.log('[useQuestions] Iniciando busca...', { certificationId, tier, limit, domains, shuffle, seed, take, language, preloadBoth });
      setLoading(true);
      setError(null);

      try {
        // Se já temos cache para o mesmo dataset, apenas troca de idioma sem refetch
        if (preloadBoth && bilingualCache && lastKey === depsKey) {
          setQuestions(language === 'pt-BR' ? bilingualCache['pt-BR'] : bilingualCache['en']);
          setLoading(false);
          return;
        }

        const baseFilters: QuizFilters = {
          certificationId,
          domains,
          tier,
          limit,
          shuffle,
          seed,
          take,
        };

        if (preloadBoth) {
          const [dbEn, dbPt] = await Promise.all([
            fetchQuestions({ ...baseFilters, language: 'en' }),
            fetchQuestions({ ...baseFilters, language: 'pt-BR' }),
          ]);

          const enQuestions = dbEn.map(convertDBQuestionToAppFormat);
          const ptQuestions = dbPt.map(convertDBQuestionToAppFormat);

          // Monta mapa por baseId
          const map: Record<string, { en?: Question; ['pt-BR']?: Question }> = {};
          const anchorList = anchorLanguage === 'en' ? enQuestions : ptQuestions;
          const altList = anchorLanguage === 'en' ? ptQuestions : enQuestions;

          anchorList.forEach((q) => {
            const baseId = getBaseQuestionId(q.id);
            map[baseId] = map[baseId] || {};
            (map[baseId] as any)[anchorLanguage] = q;
          });
          altList.forEach((q) => {
            const baseId = getBaseQuestionId(q.id);
            map[baseId] = map[baseId] || {};
            (map[baseId] as any)[anchorLanguage === 'en' ? 'pt-BR' : 'en'] = q;
          });

          // Ordem determinística: segue anchor e acrescenta bases faltantes do alt
          const order: string[] = [];
          anchorList.forEach((q) => order.push(getBaseQuestionId(q.id)));
          altList.forEach((q) => {
            const base = getBaseQuestionId(q.id);
            if (!order.includes(base)) order.push(base);
          });

          const buildList = (lang: 'en' | 'pt-BR') => {
            const other = lang === 'en' ? 'pt-BR' : 'en';
            return order
              .map((base) => {
                const entry = map[base];
                return (entry && (entry as any)[lang]) || (entry && (entry as any)[other]);
              })
              .filter(Boolean) as Question[];
          };

          const cache = {
            'en': buildList('en'),
            'pt-BR': buildList('pt-BR'),
          };

          setBilingualCache(cache);
          setLastKey(depsKey);
          setQuestions(language === 'pt-BR' ? cache['pt-BR'] : cache['en']);
        } else {
          const filters: QuizFilters = { ...baseFilters, language };
          const dbQuestions = await fetchQuestions(filters);
          const appQuestions = dbQuestions.map(convertDBQuestionToAppFormat);
          setQuestions(appQuestions);
          setBilingualCache(null);
          setLastKey(depsKey);
        }

        console.log('[useQuestions] ✅ Questões carregadas');
      } catch (err) {
        console.error('[useQuestions] ❌ Erro ao buscar questões:', err);
        setError(err as Error);
        setQuestions([]); // Fallback para array vazio
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [depsKey, language, enabled, preloadBoth, anchorLanguage]);

  return { questions, loading, error };
}
