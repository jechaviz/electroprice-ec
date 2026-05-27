import React, { createContext, useEffect, ReactNode } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { languageSignal, translationsSignal, Language } from '../signals/config.signals';
import { services } from '../services/ServiceContainer';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, string>;
}

export const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useSignals();

  useEffect(() => {
    void services.language.fetchTranslations(languageSignal.value);
  }, []);

  const value = {
    language: languageSignal.value,
    setLanguage: (lang: Language) => services.language.setLanguage(lang),
    translations: translationsSignal.value,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
