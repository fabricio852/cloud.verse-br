import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguageStore } from '../stores/languageStore';
import { Question } from '../types';

/**
 * Hook que gerencia respostas e progresso independentemente de mudanças de idioma
 * Mapeia respostas por question.id em vez de índice numérico
 */
export const useLanguageAwareQuiz = (quizBank: Question[]) => {
  // Mapeia de question.id para resposta (string[] ou null)
  const [responsesByQuestionId, setResponsesByQuestionId] = useState<Record<string, string[] | null>>({});

  // Mapeia de question.id para "marcado para revisão"
  const [markedByQuestionId, setMarkedByQuestionId] = useState<Record<string, boolean>>({});

  // Índice na lista atual
  const [currentIndex, setCurrentIndex] = useState(0);

  // Contador de questões respondidas (para validação)
  const language = useLanguageStore((state) => state.language);

  /**
   * Ao mudar quizBank ou idioma, sincroniza o índice para a mesma pergunta se possível
   */
  useEffect(() => {
    if (!quizBank || quizBank.length === 0) {
      setCurrentIndex(0);
      return;
    }

    // Se há uma pergunta atual, tenta encontrá-la na nova lista
    if (currentIndex < quizBank.length) {
      const currentQuestion = quizBank[currentIndex];
      // Se encontrou a mesma pergunta, mantém o índice
      if (currentQuestion && responsesByQuestionId[currentQuestion.id] !== undefined) {
        // Pergunta já foi respondida, mantém índice
        return;
      }
    }

    // Senão, volta para primeira questão
    setCurrentIndex(0);
  }, [quizBank?.length, language]);

  /**
   * Retorna a questão atual baseada no índice
   */
  const currentQuestion = useMemo(() => {
    if (!quizBank || quizBank.length === 0) return null;
    return quizBank[currentIndex % quizBank.length];
  }, [quizBank, currentIndex]);

  /**
   * Retorna resposta da questão atual
   */
  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return null;
    return responsesByQuestionId[currentQuestion.id] || null;
  }, [currentQuestion, responsesByQuestionId]);

  /**
   * Retorna se questão atual está marcada
   */
  const isCurrentMarked = useMemo(() => {
    if (!currentQuestion) return false;
    return markedByQuestionId[currentQuestion.id] || false;
  }, [currentQuestion, markedByQuestionId]);

  /**
   * Registra resposta para a questão atual pelo seu ID
   */
  const recordAnswer = useCallback((answer: string[] | null) => {
    if (!currentQuestion) return;

    setResponsesByQuestionId((prev) => ({
      ...prev,
      [currentQuestion.id]: answer && answer.length > 0 ? answer : null,
    }));
  }, [currentQuestion]);

  /**
   * Alterna marcação para a questão atual
   */
  const toggleMark = useCallback(() => {
    if (!currentQuestion) return;

    setMarkedByQuestionId((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  }, [currentQuestion]);

  /**
   * Navega para próxima questão
   */
  const goToNext = useCallback(() => {
    if (!quizBank || quizBank.length === 0) return;
    setCurrentIndex((prev) => (prev + 1 < quizBank.length ? prev + 1 : prev));
  }, [quizBank?.length]);

  /**
   * Navega para questão anterior
   */
  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  /**
   * Salta para questão específica pelo índice
   */
  const jumpToIndex = useCallback((index: number) => {
    if (!quizBank || index < 0 || index >= quizBank.length) return;
    setCurrentIndex(index);
  }, [quizBank?.length]);

  /**
   * Retorna status visual de cada questão (respondida, marcada, pendente)
   */
  const getQuestionStatus = useCallback(
    (index: number) => {
      if (!quizBank || !quizBank[index]) return 'pending';

      const q = quizBank[index];
      const isMarked = markedByQuestionId[q.id];
      const hasAnswer = responsesByQuestionId[q.id];

      if (isMarked) return 'marked';
      if (hasAnswer) return 'answered';
      return 'pending';
    },
    [quizBank, responsesByQuestionId, markedByQuestionId]
  );

  /**
   * Contagem de questões respondidas (independente de idioma)
   */
  const answeredCount = useMemo(() => {
    return Object.values(responsesByQuestionId).filter((r) => r !== null && r.length > 0).length;
  }, [responsesByQuestionId]);

  /**
   * Contagem de questões marcadas
   */
  const markedCount = useMemo(() => {
    return Object.values(markedByQuestionId).filter((m) => m).length;
  }, [markedByQuestionId]);

  /**
   * Retorna todas as respostas formatadas para salvar/enviar
   */
  const getAllResponses = useCallback(() => {
    if (!quizBank) return [];

    return quizBank.map((q) => ({
      questionId: q.id,
      answer: responsesByQuestionId[q.id] || null,
    }));
  }, [quizBank, responsesByQuestionId]);

  /**
   * Retorna estatísticas por domínio
   */
  const getDomainStats = useCallback(() => {
    if (!quizBank) return { correct: {}, total: {} };

    const domainStats = { correct: {} as Record<string, number>, total: {} as Record<string, number> };

    quizBank.forEach((q) => {
      const domain = q.domain;
      domainStats.total[domain] = (domainStats.total[domain] || 0) + 1;

      const answer = responsesByQuestionId[q.id];
      if (answer && 'answerKey' in q) {
        const isCorrect = JSON.stringify(answer.sort()) === JSON.stringify((q as any).answerKey.sort());
        if (isCorrect) {
          domainStats.correct[domain] = (domainStats.correct[domain] || 0) + 1;
        }
      }
    });

    return domainStats;
  }, [quizBank, responsesByQuestionId]);

  return {
    // Estado
    currentIndex,
    currentQuestion,
    currentAnswer,
    isCurrentMarked,
    responsesByQuestionId,
    markedByQuestionId,

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
