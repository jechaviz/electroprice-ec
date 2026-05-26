import type { Currency, Product, Rates, SortOption } from '../types';
import { getProductDisplayPrice, getLowestWholesalerPrice } from './pricing';

export type CatalogStockFilter = 'available' | 'out-of-stock';

export interface ProductIndexFields {
  searchText: string;
  bestPrice: number | null;
  totalStock: number;
  isDeal: boolean;
  indexedAt: string;
}

export interface CatalogFilterState {
  priceRange: [number, number];
  minRating: number;
  smartFilterValues: Record<string, number | string[]>;
  dealsOnly: boolean;
  stockFilter?: CatalogStockFilter;
  searchTerm?: string;
  rates: Rates | null;
  currency: Currency;
}

type ProductRecordLike = Partial<Product> & {
  image_url?: string;
  avg_rating?: number;
  review_count?: number;
  wholesaler_stock?: Product['wholesalerStock'];
  price_history?: Product['priceHistory'];
  old_price?: number;
  deal_tag?: string;
  smart_tag?: string;
  feature_score?: number;
  canonical_key?: string;
  canonical_ids?: Product['canonicalIds'];
  provider_aliases?: Product['providerAliases'];
  model_number?: string;
  search_text?: string;
  description?: string;
  specs?: Product['specs'];
  best_price?: number | null;
  total_stock?: number;
  is_deal?: boolean;
};

const RECENT_DEAL_DAYS = 30;
const MAX_SEARCH_TEXT_LENGTH = 4800;
const OUT_OF_STOCK_SEARCH_INTENT = /\b(agotad[oa]s?|sin\s+(stock|existencias?)|no\s+disponibles?|out\s+of\s+stock|sold\s+out|unavailable)\b/gi;
const SPEC_KEY_ALIASES: Record<string, string[]> = {
  ram: ['memory', 'memoria'],
  memory: ['ram', 'memoria'],
  storage: ['almacenamiento', 'capacity', 'capacidad'],
  camera: ['camara', 'megapixels', 'megapixeles', 'mp'],
};

export const normalizeCatalogText = (value: string): string => (
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
);

const limitCatalogSearchText = (value: string): string => {
  if (value.length <= MAX_SEARCH_TEXT_LENGTH) return value;
  return value.slice(0, MAX_SEARCH_TEXT_LENGTH).replace(/\s+\S*$/, '').trim();
};

export const searchTermRequestsOutOfStock = (value: string): boolean => {
  OUT_OF_STOCK_SEARCH_INTENT.lastIndex = 0;
  return OUT_OF_STOCK_SEARCH_INTENT.test(value);
};

export const stripOutOfStockSearchIntent = (value: string): string => {
  OUT_OF_STOCK_SEARCH_INTENT.lastIndex = 0;
  return value.replace(OUT_OF_STOCK_SEARCH_INTENT, ' ').trim().replace(/\s+/g, ' ');
};

export const resolveCatalogStockFilter = (filters: Pick<CatalogFilterState, 'stockFilter' | 'searchTerm'>): CatalogStockFilter => {
  if (filters.stockFilter === 'out-of-stock' || (filters.searchTerm && searchTermRequestsOutOfStock(filters.searchTerm))) {
    return 'out-of-stock';
  }

  return 'available';
};

const getRecordArray = <T>(value: T[] | undefined, fallback: T[] | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(fallback)) return fallback;
  return [];
};

const flattenSearchValues = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(flattenSearchValues);
  if (typeof value === 'object') return Object.values(value).flatMap(flattenSearchValues);
  return [String(value)];
};

const normalizeSpecKey = (value: string): string => normalizeCatalogText(value).replace(/\s+/g, '_');

const getSpecValue = (specs: Product['specs'], key: string): string | undefined => {
  if (specs[key] !== undefined) return specs[key];

  const normalizedTarget = normalizeSpecKey(key);
  const candidates = new Set([normalizedTarget, ...(SPEC_KEY_ALIASES[normalizedTarget] || [])].map(normalizeSpecKey));

  for (const [specKey, specValue] of Object.entries(specs)) {
    if (candidates.has(normalizeSpecKey(specKey))) {
      return specValue;
    }
  }

  return undefined;
};

const parseCatalogNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  const match = String(value ?? '').match(/-?\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : NaN;
};

export const getIndexedBestPrice = (product: Product): number | null => {
  const stockPrice = getLowestWholesalerPrice(product);
  if (stockPrice !== null) return stockPrice;

  return typeof product.bestPrice === 'number' && product.bestPrice > 0 ? product.bestPrice : null;
};

export const getIndexedTotalStock = (product: Product): number => {
  if (typeof product.totalStock === 'number') {
    return product.totalStock;
  }

  return product.wholesalerStock.reduce((sum, stock) => sum + Math.max(0, stock.stock), 0);
};

export const isCatalogDeal = (product: Product): boolean => {
  if (product.isDeal || product.dealTag || product.oldPrice) {
    return true;
  }

  const bestPrice = getIndexedBestPrice(product);
  if (!bestPrice || product.priceHistory.length < 2) {
    return false;
  }

  const since = new Date();
  since.setDate(since.getDate() - RECENT_DEAL_DAYS);

  const recentPrices = product.priceHistory
    .filter((entry) => new Date(entry.date) >= since)
    .map((entry) => entry.price)
    .filter((price) => Number.isFinite(price) && price > 0);

  if (recentPrices.length < 2) {
    return false;
  }

  return bestPrice < Math.max(...recentPrices) * 0.9;
};

export const deriveProductIndex = (product: ProductRecordLike): ProductIndexFields => {
  const wholesalerStock = getRecordArray(product.wholesalerStock, product.wholesaler_stock);
  const priceHistory = getRecordArray(product.priceHistory, product.price_history);
  const totalStock = wholesalerStock.reduce((sum, stock) => sum + Math.max(0, stock.stock || 0), 0);
  const availablePrices = wholesalerStock
    .filter((stock) => stock.stock > 0)
    .map((stock) => stock.price)
    .filter((price) => Number.isFinite(price) && price > 0);
  const fallbackPrices = wholesalerStock.map((stock) => stock.price).filter((price) => Number.isFinite(price) && price > 0);
  const prices = availablePrices.length > 0 || totalStock > 0 ? availablePrices : fallbackPrices;
  const bestPrice = prices.length > 0 ? Math.min(...prices) : null;
  const oldPrice = product.oldPrice ?? product.old_price;
  const dealTag = product.dealTag ?? product.deal_tag;
  const modelNumber = product.modelNumber ?? product.model_number;
  const canonicalKey = product.canonicalKey ?? product.canonical_key;
  const canonicalIds = product.canonicalIds ?? product.canonical_ids;
  const providerAliases = product.providerAliases ?? product.provider_aliases;

  const searchText = limitCatalogSearchText(normalizeCatalogText([
    product.name,
    product.brand,
    product.category,
    modelNumber,
    canonicalKey,
    dealTag,
    product.smartTag ?? product.smart_tag,
    product.description,
    ...flattenSearchValues(product.specs),
    ...flattenSearchValues(canonicalIds),
    ...flattenSearchValues(providerAliases),
  ].filter(Boolean).join(' ')));

  const indexedProduct = {
    ...product,
    wholesalerStock,
    priceHistory,
    bestPrice,
    oldPrice,
    dealTag,
  } as Product;

  return {
    searchText,
    bestPrice,
    totalStock,
    isDeal: isCatalogDeal(indexedProduct),
    indexedAt: new Date().toISOString(),
  };
};

export const toProductIndexRecordFields = (product: ProductRecordLike) => {
  const index = deriveProductIndex(product);
  return {
    search_text: index.searchText,
    best_price: index.bestPrice,
    total_stock: index.totalStock,
    is_deal: index.isDeal,
    indexed_at: index.indexedAt,
  };
};

export const productMatchesCatalogFilters = (product: Product, filters: CatalogFilterState): boolean => {
  const displayPrice = getProductDisplayPrice(product);
  if (displayPrice === null) {
    return false;
  }

  const stockFilter = resolveCatalogStockFilter(filters);
  const stockMatch = stockFilter === 'out-of-stock'
    ? getIndexedTotalStock(product) <= 0
    : getIndexedTotalStock(product) > 0;
  const exchangeRate = filters.rates?.[filters.currency] ?? 1;
  const displayPriceInCurrency = displayPrice * exchangeRate;
  const priceMatch = displayPriceInCurrency >= filters.priceRange[0] && displayPriceInCurrency <= filters.priceRange[1];
  const ratingMatch = product.avgRating >= filters.minRating;
  const dealMatch = !filters.dealsOnly || isCatalogDeal(product);
  const smartFiltersMatch = Object.entries(filters.smartFilterValues).every(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return true;
      const productValue = product[key as keyof Product];
      return typeof productValue === 'string' ? value.includes(productValue) : false;
    }

    const specValue = getSpecValue(product.specs, key);
    if (specValue === undefined || specValue === null || specValue === '') {
      return false;
    }

    const numericSpecValue = parseCatalogNumber(specValue);
    return Number.isFinite(numericSpecValue) && numericSpecValue >= value;
  });

  return stockMatch && priceMatch && ratingMatch && dealMatch && smartFiltersMatch;
};

export const sortCatalogProducts = (products: Product[], sortOption: SortOption): Product[] => {
  return [...products].sort((a, b) => {
    const priceA = getProductDisplayPrice(a) ?? Infinity;
    const priceB = getProductDisplayPrice(b) ?? Infinity;

    switch (sortOption) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'rating-desc':
        return b.avgRating - a.avgRating || b.reviewCount - a.reviewCount;
      case 'relevance':
      default:
        return b.reviewCount - a.reviewCount || b.avgRating - a.avgRating;
    }
  });
};
