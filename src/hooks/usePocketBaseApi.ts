import { useState, useCallback } from 'react';
import { loadPocketBase } from '../utils/pocketBaseClient';
import type { Product } from '../types';

export const usePocketBaseApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async (searchTerm?: string, category?: string | null): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      const pb = await loadPocketBase();
      let filter = '';
      const parts: string[] = [];

      if (category) {
        parts.push(`category = "${category}"`);
      }

      if (searchTerm) {
        parts.push(`(name ~ "${searchTerm}" || brand ~ "${searchTerm}")`);
      }

      filter = parts.join(' && ');

      const records = await pb.collection('products').getFullList({
        filter: filter,
        sort: '-created'
      });

      return records.map(p => ({
        ...p,
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        description: p.description,
        price: p.price,
        imageUrl: p.image_url,
        reviewCount: p.review_count,
        avgRating: p.avg_rating,
        wholesalerStock: p.wholesaler_stock,
        priceHistory: p.price_history,
        featureScore: p.feature_score,
        oldPrice: p.old_price,
        dealTag: p.deal_tag,
        smartTag: p.smart_tag,
        specs: p.specs || {},
        reviews: [] 
      })) as unknown as Product[];

    } catch (e) {
      console.error("Error fetching products from PocketBase:", e);
      setError(e as Error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchProductById = useCallback(async (id: string): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const pb = await loadPocketBase();
      const record = await pb.collection('products').getOne(id, {
        expand: 'reviews_via_product' // Assuming a back-relation named this way or handle reviews separately
      });
      
      if (record) {
          const expandedReviews = (record.expand?.reviews_via_product || []) as any[];
          
          return {
            ...record,
            id: record.id,
            imageUrl: record.image_url,
            reviewCount: record.review_count,
            avgRating: record.avg_rating,
            wholesalerStock: record.wholesaler_stock,
            priceHistory: record.price_history,
            featureScore: record.feature_score,
            oldPrice: record.old_price,
            dealTag: record.deal_tag,
            smartTag: record.smart_tag,
            specs: record.specs || {},
            reviews: expandedReviews.map(r => ({
                ...r,
                id: r.id,
                authorId: r.author_id,
                productId: r.product_id
            }))
          } as unknown as Product;
      }
      return null;
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchProducts, fetchProductById };
};
