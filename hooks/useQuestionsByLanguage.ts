import { useLanguageStore } from '../stores/languageStore';

export interface Question {
  id: string;
  certification_id: string;
  domain: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string;
  correct_answer: string;
  correct_answers?: string[];
  required_selection_count?: number;
  explanation_basic: string;
  explanation_detailed: string;
  incorrect_explanations: Record<string, string>;
  difficulty: string;
  tier: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para filtrar questões por idioma
 * Se o idioma é pt-BR, retorna apenas questões com sufixo -br
 * Se é en, retorna apenas questões sem sufixo -br
 */
export const useQuestionsByLanguage = () => {
  const language = useLanguageStore((state) => state.language);

  const filterQuestions = (questions: Question[]): Question[] => {
    if (language === 'pt-BR') {
      // Retorna apenas questões em português (com sufixo -br)
      return questions.filter((q) => q.id.endsWith('-br'));
    } else {
      // Retorna apenas questões em inglês (sem sufixo -br)
      return questions.filter((q) => !q.id.endsWith('-br'));
    }
  };

  const buildQuestionQuery = (baseQuery: any) => {
    if (language === 'pt-BR') {
      // Adiciona filtro para questões em português
      return baseQuery.ilike('id', '%-br');
    } else {
      // Adiciona filtro para questões em inglês
      return baseQuery.not('id', 'ilike', '%-br');
    }
  };

  return {
    language,
    filterQuestions,
    buildQuestionQuery,
    isBrazilianPortuguese: language === 'pt-BR'
  };
};
