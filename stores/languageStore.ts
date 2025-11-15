import { create } from 'zustand';

export type Language = 'en' | 'pt-BR';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: (localStorage.getItem('language') as Language) || 'en',

  setLanguage: (language: Language) => {
    localStorage.setItem('language', language);
    set({ language });
  },

  toggleLanguage: () => {
    set((state) => {
      const newLanguage = state.language === 'en' ? 'pt-BR' : 'en';
      localStorage.setItem('language', newLanguage);
      return { language: newLanguage };
    });
  }
}));
