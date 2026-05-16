import { describe, expect, it } from 'vitest';
import { getTranslationUrl } from '../services/LanguageService';

describe('getTranslationUrl', () => {
  it('builds root-relative translation URLs for the default base', () => {
    expect(getTranslationUrl('es', '/')).toBe('/i18n/es.json');
  });

  it('preserves deployed Vite base paths', () => {
    expect(getTranslationUrl('en', '/shop')).toBe('/shop/i18n/en.json');
  });
});
