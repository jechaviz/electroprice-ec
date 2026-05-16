
import { useState, useCallback } from 'react';
import { MOCK_PRODUCTS } from '../constants';
import type { Product } from '../types';

const API_DELAY = 500; // ms

export const useMockApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async (searchTerm?: string, category?: string | null): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          let results = MOCK_PRODUCTS;
          if (searchTerm) {
            results = results.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.brand.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (category) {
            results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
          }
          resolve(results);
        } catch (e) {
          setError(e as Error);
        } finally {
          setLoading(false);
        }
      }, API_DELAY);
    });
  }, []);
  
  const fetchProductById = useCallback(async (id: string): Promise<Product | undefined> => {
    setLoading(true);
    setError(null);
     return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const product = MOCK_PRODUCTS.find(p => p.id === id);
          resolve(product);
        } catch (e) {
          setError(e as Error);
        } finally {
          setLoading(false);
        }
      }, API_DELAY);
    });
  }, []);

  return { loading, error, fetchProducts, fetchProductById };
};
