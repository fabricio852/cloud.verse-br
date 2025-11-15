import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguageStore } from '../stores/languageStore';
import { Question } from '../types';
import { getBaseQuestionId } from '../utils';

/**
 * Hook que mantém progresso por ID base (sem sufixo de idioma),
 * garantindo que a navegação e respostas sobrevivam à troca de idioma.
 */
export const useLanguageAwareQuiz = (quizBank: Question[]) => {
  // Mapeia respostas e marcações por ID base (strip -br)
  const [responsesByBaseId, setResponsesByBaseId] = useState<Record<string, string[] | null>>({});
  const [markedByBaseId, setMarkedByBaseId] = useState<Record<string, boolean>>({});

  // Índice atual na lista carregada
  const [currentIndex, setCurrentIndex] = useState(0);

  // Idioma atual (para re-sync)
  const language = useLanguageStore((state) => state.language);

  /**
   * Ao mudar a lista de questões ou o idioma, tenta manter o mesmo baseId;
   * se não encontrar, volta para o início.
   */
  useEffect(() => {
    if (!quizBank || quizBank.length === 0) {
      setCurrentIndex(0);
      return;
    }

    const currentQuestion = quizBank[Math.min(currentIndex, quizBank.length - 1)];
    const currentBaseId = currentQuestion ? getBaseQuestionId(currentQuestion.id) : null;

    if (currentBaseId) {
      const matchIndex = quizBank.findIndex((q) => getBaseQuestionId(q.id) === currentBaseId);
      if (matchIndex >= 0) {
        setCurrentIndex(matchIndex);
        return;
      }
    }

    setCurrentIndex(0);
  }, [quizBank, language, currentIndex]);

  const currentQuestion = useMemo(() => {
    if (!quizBank || quizBank.length === 0) return null;
    return quizBank[currentIndex % quizBank.length];
  }, [quizBank, currentIndex]);

  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return null;
    return responsesByBaseId[getBaseQuestionId(currentQuestion.id)] || null;
  }, [currentQuestion, responsesByBaseId]);

  const isCurrentMarked = useMemo(() => {
    if (!currentQuestion) return false;
    return markedByBaseId[getBaseQuestionId(currentQuestion.id)] || false;
  }, [currentQuestion, markedByBaseId]);

  const recordAnswer = useCallback(
    (answer: string[] | null) => {
      if (!currentQuestion) return;
      const baseId = getBaseQuestionId(currentQuestion.id);
      setResponsesByBaseId((prev) => ({
        ...prev,
        [baseId]: answer && answer.length > 0 ? answer : null,
      }));
    },
    [currentQuestion]
  );

  const toggleMark = useCallback(() => {
    if (!currentQuestion) return;
    const baseId = getBaseQuestionId(currentQuestion.id);
    setMarkedByBaseId((prev) => ({
      ...prev,
      [baseId]: !prev[baseId],
    }));
  }, [currentQuestion]);

  const goToNext = useCallback(() => {
    if (!quizBank || quizBank.length === 0) return;
    setCurrentIndex((prev) => (prev + 1 < quizBank.length ? prev + 1 : prev));
  }, [quizBank]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const jumpToIndex = useCallback(
    (index: number) => {
      if (!quizBank || index < 0 || index >= quizBank.length) return;
      setCurrentIndex(index);
    },
    [quizBank]
  );

  const getQuestionStatus = useCallback(
    (index: number) => {
      if (!quizBank || !quizBank[index]) return 'pending';
      const q = quizBank[index];
      const baseId = getBaseQuestionId(q.id);
      const isMarked = markedByBaseId[baseId];
      const hasAnswer = responsesByBaseId[baseId];

      if (isMarked) return 'marked';
      if (hasAnswer) return 'answered';
      return 'pending';
    },
    [quizBank, responsesByBaseId, markedByBaseId]
  );

  const answeredCount = useMemo(() => {
    return Object.values(responsesByBaseId).filter((r) => r !== null && r.length > 0).length;
  }, [responsesByBaseId]);

  const markedCount = useMemo(() => {
    return Object.values(markedByBaseId).filter((m) => m).length;
  }, [markedByBaseId]);

  const getAllResponses = useCallback(() => {
    if (!quizBank) return [];
    return quizBank.map((q) => ({
      questionId: q.id,
      answer: responsesByBaseId[getBaseQuestionId(q.id)] || null,
      baseId: getBaseQuestionId(q.id),
      domain: q.domain,
    }));
  }, [quizBank, responsesByBaseId]);

  const getDomainStats = useCallback(() => {
    if (!quizBank) return { correct: {}, total: {} };
    const domainStats = { correct: {} as Record<string, number>, total: {} as Record<string, number> };

    quizBank.forEach((q) => {
      const domain = q.domain;
      domainStats.total[domain] = (domainStats.total[domain] || 0) + 1;

      const answer = responsesByBaseId[getBaseQuestionId(q.id)];
      if (answer && 'answerKey' in q) {
        const isCorrect = JSON.stringify(answer.slice().sort()) === JSON.stringify((q as any).answerKey.slice().sort());
        if (isCorrect) {
          domainStats.correct[domain] = (domainStats.correct[domain] || 0) + 1;
        }
      }
    });

    return domainStats;
  }, [quizBank, responsesByBaseId]);

  return {
    // Estado
    currentIndex,
    currentQuestion,
    currentAnswer,
    isCurrentMarked,
    responsesByBaseId,
    markedByBaseId,

    // Ações
    recordAnswer,
    toggleMark,
    goToNext,
    goToPrev,
    jumpToIndex,
    getQuestionStatus,
    getAllResponses,

    // Stats
    answeredCount,
    markedCount,
    getDomainStats,
  };
};
