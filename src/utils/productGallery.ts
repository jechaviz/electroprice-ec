import type { Product } from '../types';

const SUPPORTING_PRODUCT_IMAGES = [
  'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/333984/pexels-photo-333984.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export const getProductGalleryImages = (product: Pick<Product, 'imageUrl' | 'gallery'>): string[] => {
  const officialImages = [
    product.imageUrl,
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ].filter(Boolean);

  return Array.from(new Set([
    ...officialImages,
    ...(officialImages.length > 0 ? [] : SUPPORTING_PRODUCT_IMAGES),
  ]));
};
