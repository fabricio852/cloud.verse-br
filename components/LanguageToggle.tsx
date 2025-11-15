import React from 'react';
import { useLanguageStore } from '../stores/languageStore';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center justify-center text-2xl hover:opacity-80 transition-opacity"
      title={`Switch to ${language === 'en' ? 'Portuguese' : 'English'}`}
    >
      {language === 'en' ? '🇺🇸' : '🇧🇷'}
    </button>
  );
};
