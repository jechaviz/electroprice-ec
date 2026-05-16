import { describe, it, expect } from 'vitest';
import { slugify, getProductUrl, getCategoryUrl, productSlugMatchesId } from './slugify';

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('lowercases the string', () => {
    expect(slugify('HELLO')).toBe('hello');
  });

  it('replaces multiple hyphens with single', () => {
    expect(slugify('a---b')).toBe('a-b');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('-hello-')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles accents-free normalization', () => {
    expect(slugify('Telefonos y Tablets')).toBe('telefonos-y-tablets');
  });
});

describe('getProductUrl', () => {
  it('generates product URL with slug and id', () => {
    expect(getProductUrl('Samsung Galaxy S24', 'prod-023')).toBe('/product/samsung-galaxy-s24-prod-023');
  });
});

describe('productSlugMatchesId', () => {
  it('matches direct ids and generated slugs', () => {
    expect(productSlugMatchesId('bhzg3gbingz3o8n', 'bhzg3gbingz3o8n')).toBe(true);
    expect(productSlugMatchesId('hp-spectre-x360-14-bhzg3gbingz3o8n', 'bhzg3gbingz3o8n')).toBe(true);
  });

  it('matches product ids that contain hyphens', () => {
    expect(productSlugMatchesId('samsung-galaxy-s24-prod-023', 'prod-023')).toBe(true);
  });

  it('does not match partial id suffixes', () => {
    expect(productSlugMatchesId('hp-spectre-x360-14-bhzg3gbingz3o8n', 'z3o8n')).toBe(false);
  });
});

describe('getCategoryUrl', () => {
  it('generates category URL', () => {
    expect(getCategoryUrl('smartphones')).toBe('/catalog/smartphones');
  });
});
