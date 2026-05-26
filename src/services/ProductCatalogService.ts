import type { Currency, Product, Rates, Review, SortOption } from '../types';
import { currentUserSignal } from '../signals/auth.signals';
import { productsSignal } from '../signals/data.signals';
import { platformCommissionSignal } from '../signals/config.signals';
import { loadPocketBase } from '../utils/pocketBaseClient';
import { mapProductRecord, mapReviewRecord } from '../utils/mappers';
import {
  normalizeCatalogText,
  productMatchesCatalogFilters,
  resolveCatalogStockFilter,
  sortCatalogProducts,
  stripOutOfStockSearchIntent,
  toProductIndexRecordFields,
  type CatalogStockFilter,
} from '../utils/productIndex';

export const CATALOG_PAGE_SIZE = 24;
export const HOME_PRODUCT_LIMIT = 48;
export const PRODUCT_CACHE_LIMIT = 240;
const PRODUCT_PAGE_RETRY_DELAYS_MS = [160, 420, 1200, 2500, 5000, 8000];

const BASE_PRODUCT_LIST_FIELDS = [
  'id',
  'created',
  'updated',
  'name',
  'brand',
  'category',
  'image_url',
  'specs',
  'avg_rating',
  'review_count',
  'wholesaler_stock',
  'feature_score',
  'old_price',
  'watching',
  'deal_tag',
  'smart_tag',
  'options',
  'canonical_key',
  'model_number',
  'content_score',
  'identity_confidence',
  'enrichment_status',
].join(',');

const PRODUCT_LIST_FIELDS = [
  BASE_PRODUCT_LIST_FIELDS,
  'search_text',
  'best_price',
  'total_stock',
  'is_deal',
  'indexed_at',
].join(',');

interface ProductCatalogQuery {
  searchTerm: string;
  category: string | null;
  priceRange: [number, number];
  minRating: number;
  smartFilterValues: Record<string, number | string[]>;
  dealsOnly: boolean;
  stockFilter?: CatalogStockFilter;
  sortOption: SortOption;
  rates: Rates | null;
  currency: Currency;
}

interface FetchProductPageOptions extends ProductCatalogQuery {
  page: number;
  perPage?: number;
  signal?: AbortSignal;
  preferOptimizedIndexes?: boolean;
}

export interface ProductCatalogPage {
  items: Product[];
  page: number;
  perPage: number;
  hasMore: boolean;
  total?: number;
}

let optimizedIndexesAvailable = true;

const escapeFilterString = (value: string): string => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const getSearchTokens = (value: string): string[] => (
  normalizeCatalogText(value)
    .split(' ')
    .filter(Boolean)
    .slice(0, 8)
);

const isPocketBaseBadRequest = (error: unknown): boolean => {
  return typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 400;
};

const isPocketBaseTransientError = (error: unknown): boolean => (
  typeof error === 'object'
  && error !== null
  && !(error as { isAbort?: boolean }).isAbort
  && [0, 408, 429, 500, 502, 503, 504].includes((error as { status?: number }).status ?? -1)
);

const wait = (ms: number): Promise<void> => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

const getWholesaleRange = (query: ProductCatalogQuery): [number, number] => {
  const exchangeRate = query.rates?.[query.currency] ?? 1;
  const commissionMultiplier = 1 + platformCommissionSignal.value;

  return [
    query.priceRange[0] / exchangeRate / commissionMultiplier,
    query.priceRange[1] / exchangeRate / commissionMultiplier,
  ];
};

const buildFilter = (query: ProductCatalogQuery, useOptimizedIndexes: boolean): string => {
  const parts: string[] = [];

  if (query.category) {
    parts.push(`category = "${escapeFilterString(query.category)}"`);
  }

  const stockFilter = resolveCatalogStockFilter(query);
  const productSearchTerm = stripOutOfStockSearchIntent(query.searchTerm);

  if (productSearchTerm.trim()) {
    const normalizedTokens = getSearchTokens(productSearchTerm).map(escapeFilterString);
    const rawTerm = escapeFilterString(productSearchTerm.trim());
    parts.push(useOptimizedIndexes
      ? normalizedTokens.map((token) => `search_text ~ "${token}"`).join(' && ')
      : `((name ~ "${rawTerm}") || (brand ~ "${rawTerm}") || (model_number ~ "${rawTerm}"))`);
  }

  if (query.minRating > 0) {
    parts.push(`avg_rating >= ${query.minRating}`);
  }

  for (const [key, value] of Object.entries(query.smartFilterValues)) {
    if (key !== 'brand' || !Array.isArray(value) || value.length === 0) continue;
    parts.push(`(${value.map((brand) => `brand = "${escapeFilterString(brand)}"`).join(' || ')})`);
  }

  if (useOptimizedIndexes) {
    parts.push(stockFilter === 'out-of-stock' ? 'total_stock <= 0' : 'total_stock > 0');

    const [minWholesalePrice, maxWholesalePrice] = getWholesaleRange(query);
    if (minWholesalePrice > 0) {
      parts.push(`best_price >= ${minWholesalePrice}`);
    }
    if (maxWholesalePrice < 1e9) {
      parts.push(`best_price <= ${maxWholesalePrice}`);
    }
    if (query.dealsOnly) {
      parts.push(`(is_deal = true || deal_tag != "" || old_price > 0)`);
    }
  }

  return parts.join(' && ');
};

export const buildProductCatalogFilterForTest = buildFilter;

const getServerSort = (sortOption: SortOption, useOptimizedIndexes: boolean): string => {
  if (useOptimizedIndexes) {
    if (sortOption === 'price-asc') return 'best_price,id';
    if (sortOption === 'price-desc') return '-best_price,id';
  }

  if (sortOption === 'rating-desc') return '-avg_rating,-review_count,id';
  return '-review_count,-avg_rating,id';
};

const fetchWithSignal = (signal?: AbortSignal) => (
  signal
    ? async (url: RequestInfo | URL, config?: RequestInit) => fetch(url, { ...config, signal })
    : undefined
);

const mergeProduct = (existing: Product | undefined, incoming: Product): Product => {
  if (!existing) return incoming;

  return {
    ...existing,
    ...incoming,
    reviews: incoming.reviews.length > 0 ? incoming.reviews : existing.reviews,
    priceHistory: incoming.priceHistory.length > 0 ? incoming.priceHistory : existing.priceHistory,
    gallery: incoming.gallery && incoming.gallery.length > 0 ? incoming.gallery : existing.gallery,
    documents: incoming.documents && incoming.documents.length > 0 ? incoming.documents : existing.documents,
    softwareLinks: incoming.softwareLinks && incoming.softwareLinks.length > 0 ? incoming.softwareLinks : existing.softwareLinks,
  };
};

export class ProductCatalogService {
  static mergeProductsIntoCache(products: Product[], limit = PRODUCT_CACHE_LIMIT) {
    if (products.length === 0) return;

    const user = currentUserSignal.value;
    const protectedIds = new Set([
      ...(user?.cart.map((item) => item.productId) ?? []),
      ...(user?.favorites ?? []),
    ]);
    const incomingIds = new Set(products.map((product) => product.id));
    const byId = new Map<string, Product>();

    for (const product of productsSignal.value) {
      byId.set(product.id, product);
    }

    for (const product of products) {
      byId.set(product.id, mergeProduct(byId.get(product.id), product));
    }

    const orderedProducts = [
      ...products.map((product) => byId.get(product.id)).filter((product): product is Product => Boolean(product)),
      ...productsSignal.value
        .filter((product) => !incomingIds.has(product.id))
        .map((product) => byId.get(product.id))
        .filter((product): product is Product => Boolean(product)),
    ];

    productsSignal.value = orderedProducts.filter((product, index) => index < limit || protectedIds.has(product.id));
  }

  static async fetchProductPage(options: FetchProductPageOptions): Promise<ProductCatalogPage> {
    const perPage = options.perPage ?? CATALOG_PAGE_SIZE;
    const shouldUseOptimizedIndexes = optimizedIndexesAvailable && (options.preferOptimizedIndexes ?? true);

    for (let attempt = 0; attempt <= PRODUCT_PAGE_RETRY_DELAYS_MS.length; attempt++) {
      try {
        const pb = await loadPocketBase();
        const filter = buildFilter(options, shouldUseOptimizedIndexes);
        const result = await pb.collection('products').getList(options.page, perPage, {
          filter,
          sort: getServerSort(options.sortOption, shouldUseOptimizedIndexes),
          fields: shouldUseOptimizedIndexes ? PRODUCT_LIST_FIELDS : BASE_PRODUCT_LIST_FIELDS,
          skipTotal: options.page > 1,
          fetch: fetchWithSignal(options.signal),
        });

        const mapped = result.items.map(mapProductRecord);
        const filtered = mapped.filter((product) => productMatchesCatalogFilters(product, options));
        const sorted = shouldUseOptimizedIndexes ? filtered : sortCatalogProducts(filtered, options.sortOption);

        this.mergeProductsIntoCache(sorted);

        return {
          items: sorted,
          page: options.page,
          perPage,
          hasMore: result.items.length === perPage,
          total: options.page === 1 ? result.totalItems : undefined,
        };
      } catch (error) {
        if (shouldUseOptimizedIndexes && isPocketBaseBadRequest(error)) {
          optimizedIndexesAvailable = false;
          return this.fetchProductPage({ ...options, preferOptimizedIndexes: false });
        }

        const retryDelay = PRODUCT_PAGE_RETRY_DELAYS_MS[attempt];
        if (retryDelay !== undefined && isPocketBaseTransientError(error)) {
          await wait(retryDelay);
          continue;
        }

        throw error;
      }
    }

    throw new Error('Product page fetch retry loop exhausted.');
  }

  static async fetchPublicPreview(signal?: AbortSignal): Promise<Product[]> {
    const page = await this.fetchProductPage({
      page: 1,
      perPage: HOME_PRODUCT_LIMIT,
      searchTerm: '',
      category: null,
      priceRange: [0, Infinity],
      minRating: 0,
      smartFilterValues: {},
      dealsOnly: false,
      stockFilter: 'available',
      sortOption: 'relevance',
      rates: { USD: 1, MXN: 20 },
      currency: 'USD',
      signal,
    });

    return page.items;
  }

  static async fetchProductReviews(productId: string): Promise<Review[]> {
    const pb = await loadPocketBase();
    const records = await pb.collection('reviews').getFullList({
      filter: `product_id = "${escapeFilterString(productId)}"`,
      sort: '-date',
    });

    return records.map(mapReviewRecord);
  }

  static async fetchProductDetail(productId: string): Promise<Product | null> {
    try {
      const pb = await loadPocketBase();
      const [productRecord, reviews] = await Promise.all([
        pb.collection('products').getOne(productId),
        this.fetchProductReviews(productId).catch(() => []),
      ]);
      const product = {
        ...mapProductRecord(productRecord),
        reviews,
      };

      this.mergeProductsIntoCache([product]);
      return product;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 404) {
        return null;
      }

      throw error;
    }
  }

  static async fetchProductFromSlugCandidates(candidates: string[]): Promise<Product | null> {
    for (const candidate of candidates) {
      const product = await this.fetchProductDetail(candidate);
      if (product) return product;
    }

    return null;
  }

  static productIndexPayload(product: Product) {
    return toProductIndexRecordFields(product);
  }
}
