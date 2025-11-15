import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar recursos de tradução
import ptBRCommon from './locales/pt-BR/common.json';
import ptBRLanding from './locales/pt-BR/landing.json';
import ptBRDashboard from './locales/pt-BR/dashboard.json';
import ptBRQuiz from './locales/pt-BR/quiz.json';
import ptBRResults from './locales/pt-BR/results.json';
import ptBRDomains from './locales/pt-BR/domains.json';
import ptBRTour from './locales/pt-BR/tour.json';
import ptBRConstants from './locales/pt-BR/constants.json';

const resources = {
  'pt-BR': {
    common: ptBRCommon,
    landing: ptBRLanding,
    dashboard: ptBRDashboard,
    quiz: ptBRQuiz,
    results: ptBRResults,
    domains: ptBRDomains,
    tour: ptBRTour,
    constants: ptBRConstants,
  },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    ns: ['common', 'landing', 'dashboard', 'quiz', 'results', 'domains', 'tour', 'constants'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
