import { taxRateSignal, baseShippingFeeSignal, freeShippingThresholdSignal, platformCommissionSignal } from '../signals/config.signals';

export interface PricingConfig {
  taxRate: number;
  baseShippingFee: number;
  freeShippingThreshold: number;
  platformCommission: number;
}

export interface OrderAmounts {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

const roundMoney = (amount: number): number => Math.round((amount + Number.EPSILON) * 100) / 100;

export const getPricingConfig = (): PricingConfig => ({
  taxRate: taxRateSignal.value,
  baseShippingFee: baseShippingFeeSignal.value,
  freeShippingThreshold: freeShippingThresholdSignal.value,
  platformCommission: platformCommissionSignal.value,
});

export const formatTaxRate = (rate = getPricingConfig().taxRate): string => `${roundMoney(rate * 100)}%`;

export const calculateRetailPrice = (basePrice: number): number => {
  return roundMoney(basePrice * (1 + platformCommissionSignal.value));
};

export const calculateOrderAmounts = (subtotal: number, config = getPricingConfig()): OrderAmounts => {
  const normalizedSubtotal = roundMoney(Math.max(0, subtotal));
  const tax = roundMoney(normalizedSubtotal * config.taxRate);
  const shipping = normalizedSubtotal > 0 && normalizedSubtotal < config.freeShippingThreshold
    ? roundMoney(config.baseShippingFee)
    : 0;

  return {
    subtotal: normalizedSubtotal,
    tax,
    shipping,
    total: roundMoney(normalizedSubtotal + tax + shipping),
  };
};

import type { Product } from '../types';

export const getLowestWholesalerPrice = (product: Product): number | null => {
  const stock = product.wholesalerStock || [];
  const availablePrices = stock
    .filter((item) => item.stock > 0)
    .map((item) => item.price)
    .filter((price) => price > 0);

  if (availablePrices.length > 0) {
    return Math.min(...availablePrices);
  }

  if (stock.length === 0 && typeof product.bestPrice === 'number' && product.bestPrice > 0) {
    return product.bestPrice;
  }

  const totalStock = typeof product.totalStock === 'number'
    ? product.totalStock
    : stock.reduce((sum, item) => sum + Math.max(0, item.stock), 0);
  if (totalStock > 0) {
    return null;
  }

  const fallbackPrices = stock.map((item) => item.price).filter((price) => price > 0);
  return fallbackPrices.length > 0 ? Math.min(...fallbackPrices) : null;
};

export const getProductDisplayPrice = (product: Product): number | null => {
  const lowestPrice = getLowestWholesalerPrice(product);
  if (lowestPrice === null) return null;
  return calculateRetailPrice(lowestPrice);
};
