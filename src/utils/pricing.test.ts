import { describe, expect, it } from 'vitest';
import { calculateOrderAmounts } from './pricing';

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
