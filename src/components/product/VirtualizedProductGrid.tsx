import React, { useEffect, useRef, useState } from 'react';
import type { Product } from '../../types';
import ProductCard from './ProductCard';

interface VirtualizedProductGridProps {
  products: Product[];
  ariaLabel: string;
}

const OVERSCAN_ROWS = 2;
const GRID_GAP = 32;
const VIRTUALIZATION_THRESHOLD = 36;

const getColumnCount = () => {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth >= 1280) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
};

const getRowHeight = (columnCount: number) => {
  if (columnCount === 1) return 620;
  if (columnCount === 2) return 590;
  return 560;
};

const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({ products, ariaLabel }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [columnCount, setColumnCount] = useState(getColumnCount);
  const [viewport, setViewport] = useState({
    scrollY: 0,
    height: typeof window === 'undefined' ? 800 : window.innerHeight,
    containerTop: 0,
  });
  const shouldVirtualize = products.length > VIRTUALIZATION_THRESHOLD;
  const rowHeight = getRowHeight(columnCount);

  useEffect(() => {
    if (!shouldVirtualize) return;

    const updateViewport = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const containerTop = containerRef.current
          ? containerRef.current.getBoundingClientRect().top + window.scrollY
          : 0;
        setViewport({
          scrollY: window.scrollY,
          height: window.innerHeight,
          containerTop,
        });
        setColumnCount(getColumnCount());
      });
    };

    updateViewport();
    window.addEventListener('scroll', updateViewport, { passive: true });
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [shouldVirtualize]);

  if (!shouldVirtualize) {
    return (
      <section id="product-grid-view" role="region" aria-label={ariaLabel}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    );
  }

  const relativeScrollTop = Math.max(0, viewport.scrollY - viewport.containerTop);
  const startRow = Math.max(0, Math.floor(relativeScrollTop / rowHeight) - OVERSCAN_ROWS);
  const visibleRowCount = Math.ceil(viewport.height / rowHeight) + OVERSCAN_ROWS * 2;
  const totalRows = Math.ceil(products.length / columnCount);
  const endRow = Math.min(totalRows, startRow + visibleRowCount);
  const totalHeight = totalRows * rowHeight + Math.max(0, totalRows - 1) * GRID_GAP;

  return (
    <section id="product-grid-view" role="region" aria-label={ariaLabel}>
      <div ref={containerRef} className="relative w-full" style={{ height: totalHeight }}>
        {Array.from({ length: endRow - startRow }, (_, rowOffset) => {
          const rowIndex = startRow + rowOffset;
          const rowProducts = products.slice(rowIndex * columnCount, rowIndex * columnCount + columnCount);
          return (
            <div
              key={`catalog-row-${rowIndex}`}
              className="absolute left-0 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3"
              style={{
                top: rowIndex * (rowHeight + GRID_GAP),
                minHeight: rowHeight,
              }}
            >
              {rowProducts.map((product) => (
                <div key={product.id} className="min-w-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default VirtualizedProductGrid;
