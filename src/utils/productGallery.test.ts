import { describe, expect, it } from 'vitest';
import { getProductGalleryImages } from './productGallery';

describe('getProductGalleryImages', () => {
  it('keeps the product image first and removes duplicates', () => {
    const images = getProductGalleryImages({ imageUrl: 'https://example.com/product.jpg' });

    expect(images[0]).toBe('https://example.com/product.jpg');
    expect(new Set(images).size).toBe(images.length);
    expect(images.length).toBeGreaterThan(1);
  });
});
