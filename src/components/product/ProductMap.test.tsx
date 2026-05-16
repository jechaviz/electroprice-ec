import { fireEvent, render, screen } from '@testing-library/react';
import type { ContextType } from 'react';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import type { Product } from '../../types';

const { useCurrencyMock, useTranslationMock } = vi.hoisted(() => ({
  useCurrencyMock: vi.fn(),
  useTranslationMock: vi.fn(),
}));

vi.mock('../../contexts/CurrencyContext', () => ({
  useCurrency: () => useCurrencyMock(),
}));

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => useTranslationMock(),
}));

vi.mock('../../contexts/AppContext', async () => {
  const React = await import('react');
  return {
    AppContext: React.createContext({}),
  };
});

vi.mock('../common/StarRating', () => ({
  default: ({ rating }: { rating: number }) => <span>{rating}</span>,
}));

import { AppContext } from '../../contexts/AppContext';
import ProductMap from './ProductMap';

const createProduct = (overrides: Partial<Product>): Product => ({
  id: 'product-1',
  name: 'Product',
  brand: 'Brand',
  category: 'Category',
  imageUrl: '/product.png',
  description: 'Description',
  specs: { size: 'Medium' },
  avgRating: 4.2,
  reviewCount: 12,
  wholesalerStock: [{ wholesalerId: 'wh-1', price: 500, stock: 5 }],
  reviews: [],
  priceHistory: [],
  featureScore: 80,
  ...overrides,
});

const products: Product[] = [
  createProduct({
    id: 'alpha',
    name: 'Alpha Laptop',
    featureScore: 95,
    wholesalerStock: [
      { wholesalerId: 'wh-1', price: 500, stock: 3 },
      { wholesalerId: 'wh-2', price: 450, stock: 1 },
    ],
  }),
  createProduct({
    id: 'beta',
    name: 'Beta Monitor',
    featureScore: 70,
    wholesalerStock: [{ wholesalerId: 'wh-3', price: 300, stock: 2 }],
  }),
  createProduct({
    id: 'gamma',
    name: 'Gamma Speaker',
    featureScore: 60,
    wholesalerStock: [],
  }),
];

const renderProductMap = (contextOverrides: Record<string, unknown> = {}) => {
  const contextValue = {
    navigateToProduct: vi.fn(),
    highlightedProductId: null,
    setHighlightedProductId: vi.fn(),
    ...contextOverrides,
  };

  render(
    <AppContext.Provider value={contextValue as unknown as ContextType<typeof AppContext>}>
      <ProductMap products={products} />
    </AppContext.Provider>
  );

  return contextValue;
};

describe('ProductMap', () => {
  beforeEach(() => {
    useCurrencyMock.mockReturnValue({
      currency: 'USD',
      rates: { USD: 2, MXN: 40 },
      formatPrice: (price: number) => `$${(price * 2).toFixed(2)}`,
    });

    useTranslationMock.mockReturnValue({
      t: (key: string) =>
        ({
          'scatterPlot.xAxis': 'Price',
          'scatterPlot.yAxis': 'Feature Score',
        })[key] ?? key,
    });
  });

  it('renders comparison points for products with wholesale pricing', () => {
    renderProductMap();

    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Feature Score')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Alpha Laptop/i })).toHaveAccessibleName(
      /Alpha Laptop, \$1035\.00, feature score 95/i
    );
    expect(screen.getByRole('button', { name: /Beta Monitor/i })).toHaveAccessibleName(
      /Beta Monitor, \$690\.00, feature score 70/i
    );
    expect(screen.queryByRole('button', { name: /Gamma Speaker/i })).not.toBeInTheDocument();
  });

  it('connects point hover, selection, and chart leave handlers to app state', () => {
    const contextValue = renderProductMap({
      navigateToProduct: vi.fn(),
      setHighlightedProductId: vi.fn(),
    });

    fireEvent.mouseEnter(screen.getByRole('button', { name: /Beta Monitor/i }));
    fireEvent.click(screen.getByRole('button', { name: /Beta Monitor/i }));
    fireEvent.mouseLeave(screen.getByRole('img', { name: /Price vs Feature Score/i }));

    expect(contextValue.setHighlightedProductId).toHaveBeenNthCalledWith(1, 'beta');
    expect(contextValue.navigateToProduct).toHaveBeenCalledWith(expect.objectContaining({ id: 'beta' }));
    expect(contextValue.setHighlightedProductId).toHaveBeenNthCalledWith(2, null);
  });
});
