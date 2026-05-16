import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { translations } = useContext(LanguageContext);

  // FIX: Implement interpolation to handle dynamic values in translations.
  // The original function only accepted a key, causing a TypeScript error in `ProductCard.tsx` when it was called with substitution values.
  const t = (key: string, options?: Record<string, string | number>): string => {
    let translation = translations[key] || key;

    if (options) {
      Object.entries(options).forEach(([k, value]) => {
        const regex = new RegExp(`{{${k}}}`, 'g');
        translation = translation.replace(regex, String(value));
      });
    }

    return translation;
  };

  return { t };
};
