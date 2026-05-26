import { describe, expect, it } from 'vitest';
import { calculateOrderAmounts, getLowestWholesalerPrice } from './pricing';
import type { Product } from '../types';

const pricingConfig = {
  taxRate: 0.16,
  baseShippingFee: 5.99,
  freeShippingThreshold: 100,
  platformCommission: 0.15,
};

describe('calculateOrderAmounts', () => {
  it('adds checkout tax and free shipping at the threshold', () => {
    expect(calculateOrderAmounts(100, pricingConfig)).toEqual({
      subtotal: 100,
      tax: 16,
      shipping: 0,
      total: 116,
    });
  });

  it('rounds monetary values to cents and adds configured shipping below threshold', () => {
    expect(calculateOrderAmounts(10.005, pricingConfig)).toEqual({
      subtotal: 10.01,
      tax: 1.6,
      shipping: 5.99,
      total: 17.6,
    });
  });

  it('does not produce negative totals or shipping on zero subtotal', () => {
    expect(calculateOrderAmounts(-50, pricingConfig)).toEqual({
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
    });
  });
});

describe('getLowestWholesalerPrice', () => {
  const product: Product = {
    id: 'stock-aware',
    name: 'Stock-aware product',
    brand: 'ElectroPrice',
    category: 'components',
    imageUrl: '',
    description: '',
    specs: {},
    avgRating: 0,
    reviewCount: 0,
    wholesalerStock: [
      { wholesalerId: 'sold-out-cheap', price: 100, stock: 0 },
      { wholesalerId: 'available', price: 180, stock: 2 },
    ],
    reviews: [],
    priceHistory: [],
    featureScore: 0,
  };

  it('prefers the lowest price that can actually be bought', () => {
    expect(getLowestWholesalerPrice(product)).toBe(180);
  });

  it('falls back to indexed best price for compact catalog rows', () => {
    expect(getLowestWholesalerPrice({ ...product, wholesalerStock: [], bestPrice: 150, totalStock: 4 })).toBe(150);
  });
});
