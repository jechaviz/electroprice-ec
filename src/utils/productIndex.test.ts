import { describe, expect, it } from 'vitest';
import type { Product } from '../types';
import {
  deriveProductIndex,
  normalizeCatalogText,
  productMatchesCatalogFilters,
  searchTermRequestsOutOfStock,
  sortCatalogProducts,
  stripOutOfStockSearchIntent,
} from './productIndex';

const baseProduct: Product = {
  id: 'prod-1',
  name: 'Cámara Élite 4K',
  brand: 'Sony',
  category: 'cameras',
  imageUrl: 'image.jpg',
  description: 'Mirrorless camera for creator kits with stabilized 4K video.',
  specs: { Megapixels: '45', Sensor: 'Full frame' },
  avgRating: 4.7,
  reviewCount: 12,
  wholesalerStock: [
    { wholesalerId: 'a', price: 900, stock: 2 },
    { wholesalerId: 'b', price: 850, stock: 4 },
  ],
  reviews: [],
  priceHistory: [
    { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), price: 1100 },
    { date: new Date().toISOString().slice(0, 10), price: 850 },
  ],
  featureScore: 90,
  dealTag: 'Black Friday',
  smartTag: 'PremiumPerformance',
  canonicalIds: { gtin: '0012345678905', mpn: 'ILCE-7M4' },
  providerAliases: [{ providerId: 'vhub', sku: 'SONY-A7-IV', name: 'Sony A7 IV body', confidence: 0.96 }],
};

describe('productIndex', () => {
  it('normalizes accents and punctuation for compact search indexes', () => {
    expect(normalizeCatalogText('Cámara Élite 4K / Sony')).toBe('camara elite 4k sony');
  });

  it('derives compact price, stock, deal and search fields from product data', () => {
    const index = deriveProductIndex(baseProduct);

    expect(index.bestPrice).toBe(850);
    expect(index.totalStock).toBe(6);
    expect(index.isDeal).toBe(true);
    expect(index.searchText).toContain('camara elite');
    expect(index.searchText).toContain('mirrorless camera');
    expect(index.searchText).toContain('black friday');
    expect(index.searchText).toContain('sony a7 iv body');
    expect(index.searchText).toContain('ilce 7m4');
  });

  it('keeps search text below the PocketBase text field cap', () => {
    const index = deriveProductIndex({
      ...baseProduct,
      description: 'router '.repeat(1200),
      specs: { Notes: 'switch '.repeat(1200) },
    });

    expect(index.searchText.length).toBeLessThanOrEqual(4800);
  });

  it('filters against displayed currency price and smart filters without retaining unrelated rows', () => {
    expect(productMatchesCatalogFilters(baseProduct, {
      priceRange: [900, 1000],
      minRating: 4,
      smartFilterValues: { Megapixels: 40 },
      dealsOnly: true,
      rates: { USD: 1, MXN: 20 },
      currency: 'USD',
    })).toBe(true);

    expect(productMatchesCatalogFilters(baseProduct, {
      priceRange: [0, 500],
      minRating: 4,
      smartFilterValues: {},
      dealsOnly: false,
      rates: { USD: 1, MXN: 20 },
      currency: 'USD',
    })).toBe(false);
  });

  it('matches enriched spec aliases and numeric values with units', () => {
    const enriched = {
      ...baseProduct,
      category: 'laptops',
      specs: { memory: '16 GB', storage: '512 GB' },
    };

    expect(productMatchesCatalogFilters(enriched, {
      priceRange: [0, 1000],
      minRating: 0,
      smartFilterValues: { RAM: 16, Storage: 512 },
      dealsOnly: false,
      rates: { USD: 1, MXN: 20 },
      currency: 'USD',
    })).toBe(true);
  });

  it('keeps stocked products by default and only returns exhausted products on explicit intent', () => {
    const exhausted = {
      ...baseProduct,
      id: 'prod-oos',
      totalStock: 0,
      wholesalerStock: [{ wholesalerId: 'a', price: 850, stock: 0 }],
    };

    expect(productMatchesCatalogFilters(exhausted, {
      priceRange: [0, 1000],
      minRating: 0,
      smartFilterValues: {},
      dealsOnly: false,
      rates: { USD: 1, MXN: 20 },
      currency: 'USD',
    })).toBe(false);

    expect(productMatchesCatalogFilters(exhausted, {
      priceRange: [0, 1000],
      minRating: 0,
      smartFilterValues: {},
      dealsOnly: false,
      stockFilter: 'out-of-stock',
      rates: { USD: 1, MXN: 20 },
      currency: 'USD',
    })).toBe(true);
  });

  it('detects explicit out-of-stock search terms without polluting product search text', () => {
    expect(searchTermRequestsOutOfStock('laptops agotadas')).toBe(true);
    expect(stripOutOfStockSearchIntent('laptops agotadas')).toBe('laptops');
    expect(searchTermRequestsOutOfStock('laptops disponibles')).toBe(false);
  });

  it('sorts loaded catalog windows deterministically by visible price', () => {
    const cheaper = { ...baseProduct, id: 'prod-2', wholesalerStock: [{ wholesalerId: 'c', price: 300, stock: 1 }] };
    const sorted = sortCatalogProducts([baseProduct, cheaper], 'price-asc');

    expect(sorted.map(product => product.id)).toEqual(['prod-2', 'prod-1']);
  });
});
