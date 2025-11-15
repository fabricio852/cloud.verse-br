import React from 'react';
import { useLanguageStore } from '../stores/languageStore';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
      title={`Switch to ${language === 'en' ? 'Portuguese' : 'English'}`}
    >
      <span className="text-lg">
        {language === 'en' ? '🇺🇸' : '🇧🇷'}
      </span>
      <span>{language === 'en' ? 'EN' : 'PT-BR'}</span>
    </button>
  );
};
