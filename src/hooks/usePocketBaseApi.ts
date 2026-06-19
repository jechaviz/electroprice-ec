import { useState, useCallback } from 'react';
import { loadPocketBase } from '../utils/pocketBaseClient';
import type { Product } from '../types';
import { mapProductRecord } from '../utils/mappers';

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

      const records = await pb.collection('products').getList(1, 24, {
        filter: filter,
        sort: '-review_count,-created',
        skipTotal: true,
        // Hard timeout so a slow/hanging backend can never leave the catalog
        // spinning forever — abort after 15s, surface the error, and let the UI
        // recover instead of an infinite loading state.
        signal: AbortSignal.timeout(15000)
      });

      return records.items.map(mapProductRecord) as Product[];

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
        expand: 'reviews_via_product', // Assuming a back-relation named this way or handle reviews separately
        signal: AbortSignal.timeout(15000)
      });
      
      if (record) {
          const expandedReviews = (record.expand?.reviews_via_product || []) as any[];
          
          return {
            ...mapProductRecord(record),
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
