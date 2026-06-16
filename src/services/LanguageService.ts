import { languageSignal, translationsSignal, Language, LANGUAGE_STORAGE_KEY } from "../signals/config.signals";

let translationRequestId = 0;

export const getTranslationUrl = (language: Language, baseUrl: string = import.meta.env.BASE_URL): string => {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBaseUrl}i18n/${language}.json`;
};

export class LanguageService {
    static async fetchTranslations(language: Language) {
        const requestId = ++translationRequestId;
        try {
            const response = await fetch(getTranslationUrl(language));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (requestId === translationRequestId && languageSignal.value === language) {
                translationsSignal.value = data;
            }
        } catch (error) {
            console.error(`Failed to fetch translations for ${language}:`, error);
            if (language !== 'en') {
                const fallbackResponse = await fetch(getTranslationUrl('en'));
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    if (requestId === translationRequestId && languageSignal.value === language) {
                        translationsSignal.value = fallbackData;
                    }
                }
            }
        }
    }

    static setLanguage(lang: Language) {
        languageSignal.value = lang;
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        } catch {
            // Non-critical: private mode / storage quota should not block switching.
        }
        void this.fetchTranslations(lang);
    }
}
