import { languageSignal, translationsSignal, Language } from "../signals/config.signals";

export const getTranslationUrl = (language: Language, baseUrl: string = import.meta.env.BASE_URL): string => {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}i18n/${language}.json`;
};

export class LanguageService {
    static async fetchTranslations(language: Language) {
        try {
            const response = await fetch(getTranslationUrl(language));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            translationsSignal.value = data;
        } catch (error) {
            console.error(`Failed to fetch translations for ${language}:`, error);
            if (language !== 'en') {
                await this.fetchTranslations('en');
            }
        }
    }

    static setLanguage(lang: Language) {
        languageSignal.value = lang;
        void this.fetchTranslations(lang);
    }
}
