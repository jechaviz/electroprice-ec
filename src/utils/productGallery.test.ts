import { describe, expect, it } from 'vitest';
import { getProductGalleryImages } from './productGallery';

describe('getProductGalleryImages', () => {
  it('keeps official product images first and removes duplicates', () => {
    const images = getProductGalleryImages({
      imageUrl: 'https://example.com/product.jpg',
      gallery: ['https://example.com/detail.jpg', 'https://example.com/product.jpg'],
    });

    expect(images[0]).toBe('https://example.com/product.jpg');
    expect(images[1]).toBe('https://example.com/detail.jpg');
    expect(new Set(images).size).toBe(images.length);
    expect(images.length).toBe(2);
  });

  it('uses supporting images only when provider images are missing', () => {
    const images = getProductGalleryImages({ imageUrl: '' });

    expect(images.length).toBeGreaterThan(1);
    expect(images.every((url) => url.includes('pexels.com'))).toBe(true);
  });
});
