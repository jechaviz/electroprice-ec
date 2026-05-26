import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Currency, Product, Rates, SortOption } from '../types';
import { CATALOG_PAGE_SIZE, ProductCatalogService } from '../services/ProductCatalogService';
import type { CatalogStockFilter } from '../utils/productIndex';

interface UseInfiniteProductCatalogOptions {
  searchTerm: string;
  category: string | null;
  priceRange: [number, number];
  minRating: number;
  smartFilterValues: Record<string, number | string[]>;
  dealsOnly: boolean;
  stockFilter: CatalogStockFilter;
  sortOption: SortOption;
  rates: Rates | null;
  currency: Currency;
}

interface UseInfiniteProductCatalogResult {
  products: Product[];
  total: number | null;
  loadingInitial: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
  setSentinelNode: (node: HTMLDivElement | null) => void;
}

const MIN_VISIBLE_PRODUCTS_BEFORE_IDLE_PREFETCH = 12;

const getQueryKey = (options: UseInfiniteProductCatalogOptions): string => JSON.stringify({
  searchTerm: options.searchTerm.trim(),
  category: options.category,
  priceRange: options.priceRange,
  minRating: options.minRating,
  smartFilterValues: options.smartFilterValues,
  dealsOnly: options.dealsOnly,
  stockFilter: options.stockFilter,
  sortOption: options.sortOption,
  currency: options.currency,
  rates: options.rates,
});

export const useInfiniteProductCatalog = (options: UseInfiniteProductCatalogOptions): UseInfiniteProductCatalogResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const requestVersionRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  const productIdsRef = useRef<Set<string>>(new Set());
  const autoLoadLockedRef = useRef(false);
  const queryKey = useMemo(() => getQueryKey(options), [options]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const loadPage = useCallback(async (page: number, mode: 'initial' | 'more') => {
    if (loadingRef.current && mode === 'more') return;
    if (!hasMoreRef.current && mode === 'more') return;

    loadingRef.current = true;
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const requestVersion = requestVersionRef.current;

    if (mode === 'initial') {
      setLoadingInitial(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const pageResult = await ProductCatalogService.fetchProductPage({
        ...optionsRef.current,
        page,
        perPage: CATALOG_PAGE_SIZE,
        signal: abortController.signal,
      });

      if (requestVersion !== requestVersionRef.current || abortController.signal.aborted) {
        return;
      }

      setProducts((currentProducts) => {
        if (mode === 'initial') {
          productIdsRef.current = new Set(pageResult.items.map((product) => product.id));
          return pageResult.items;
        }

        const uniqueIncoming = pageResult.items.filter((product) => {
          if (productIdsRef.current.has(product.id)) return false;
          productIdsRef.current.add(product.id);
          return true;
        });

        return uniqueIncoming.length > 0 ? [...currentProducts, ...uniqueIncoming] : currentProducts;
      });
      setNextPage(page + 1);
      if (mode === 'initial') {
        setTotal(typeof pageResult.total === 'number' && pageResult.total >= 0 ? pageResult.total : null);
      }
      setHasMore(pageResult.hasMore);
      hasMoreRef.current = pageResult.hasMore;
    } catch (caughtError) {
      if (abortController.signal.aborted) {
        return;
      }
      setError(caughtError as Error);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      if (requestVersion === requestVersionRef.current) {
        loadingRef.current = false;
        autoLoadLockedRef.current = false;
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    requestVersionRef.current += 1;
    hasMoreRef.current = true;
    loadingRef.current = false;
    productIdsRef.current = new Set();
    setProducts([]);
    setTotal(null);
    setNextPage(1);
    setHasMore(true);
    autoLoadLockedRef.current = false;
    void loadPage(1, 'initial');

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadPage, queryKey]);

  useEffect(() => {
    if (loadingInitial || loadingMore || !hasMore || products.length >= MIN_VISIBLE_PRODUCTS_BEFORE_IDLE_PREFETCH) {
      return;
    }

    void loadPage(nextPage, 'more');
  }, [hasMore, loadPage, loadingInitial, loadingMore, nextPage, products.length]);

  const loadMore = useCallback(() => {
    void loadPage(nextPage, 'more');
  }, [loadPage, nextPage]);

  const setSentinelNode = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();

    if (!node) return;

    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && !autoLoadLockedRef.current) {
        autoLoadLockedRef.current = true;
        loadMore();
      }
    }, {
      root: null,
      rootMargin: '900px 0px',
      threshold: 0,
    });
    observerRef.current.observe(node);
  }, [loadMore]);

  useEffect(() => {
    const unlockAutoLoad = () => {
      autoLoadLockedRef.current = false;
    };
    window.addEventListener('wheel', unlockAutoLoad, { passive: true });
    window.addEventListener('touchmove', unlockAutoLoad, { passive: true });

    return () => {
      window.removeEventListener('wheel', unlockAutoLoad);
      window.removeEventListener('touchmove', unlockAutoLoad);
    };
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return {
    products,
    total,
    loadingInitial,
    loadingMore,
    hasMore,
    error,
    loadMore,
    setSentinelNode,
  };
};
