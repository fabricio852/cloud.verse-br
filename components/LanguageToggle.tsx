import React from 'react';
import { useLanguageStore } from '../stores/languageStore';
import i18n from '../src/i18n';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();

  const changeLang = (next: 'en' | 'pt-BR') => {
    if (language === next) return;
    setLanguage(next);
    i18n.changeLanguage(next).catch(() => {});
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 px-1 py-0.5">
      <button
        type="button"
        onClick={() => changeLang('en')}
        className={`px-2 py-1 text-xs font-semibold rounded-full transition ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="English"
      >
        🇺🇸 EN
      </button>
      <button
        type="button"
        onClick={() => changeLang('pt-BR')}
        className={`px-2 py-1 text-xs font-semibold rounded-full transition ${
          language === 'pt-BR'
            ? 'bg-green-600 text-white'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Português"
      >
        🇧🇷 PT
      </button>
    </div>
  );
};
