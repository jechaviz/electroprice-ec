import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Product } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTranslation } from '../../hooks/useTranslation';
import { AppContext } from '../../contexts/AppContext';
import { getProductDisplayPrice } from '../../utils/pricing';
import { clamp, scaleLinear, createDomain, createTicks, formatFeatureTick, getColorByValue } from '../../utils/chartUtils';
import { TooltipCard } from './TooltipCard';

interface ProductMapProps {
  products: Product[];
}

type ChartDatum = Product & {
  price: number;
  formattedPrice: string;
  valueScore: number;
};

type PositionedDatum = ChartDatum & {
  color: string;
  radius: number;
  x: number;
  y: number;
};

const CHART_MARGIN = {
  top: 24,
  right: 24,
  bottom: 72,
  left: 80,
};

const TOOLTIP_WIDTH = 256;
const TOOLTIP_HEIGHT = 220;

const ProductMap: React.FC<ProductMapProps> = ({ products }) => {
  const { currency, rates, formatPrice } = useCurrency();
  const { t } = useTranslation();
  const { navigateToProduct, highlightedProductId, setHighlightedProductId } = useContext(AppContext);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const updateSize = (width: number, height: number) => {
      const nextWidth = Math.round(width);
      const nextHeight = Math.round(height);
      setChartSize(current => current.width === nextWidth && current.height === nextHeight ? current : { width: nextWidth, height: nextHeight });
    };

    const measure = () => {
      const { width, height } = container.getBoundingClientRect();
      updateSize(width, height);
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) updateSize(entry.contentRect.width, entry.contentRect.height);
      });
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const chartData = useMemo<ChartDatum[]>(() => {
    if (!rates || !currency || products.length === 0) return [];

    const allPrices = products.map(p => getProductDisplayPrice(p) || 0).filter(p => p > 0);
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 1;
    const allScores = products.map(p => p.featureScore);
    const maxScore = allScores.length > 0 ? Math.max(...allScores) : 1;

    return products.map(product => {
      const bestPrice = getProductDisplayPrice(product);
      if (bestPrice === null) return null;

      const normalizedPrice = bestPrice / maxPrice;
      const normalizedScore = product.featureScore / maxScore;
      const valueScore = normalizedPrice > 0 ? normalizedScore / normalizedPrice : 0;

      return {
        ...product,
        price: bestPrice * rates[currency],
        formattedPrice: formatPrice(bestPrice),
        valueScore,
      };
    }).filter((p): p is ChartDatum => p !== null);
  }, [currency, formatPrice, products, rates]);

  const priceDomain = useMemo(() => createDomain(chartData.map(p => p.price), [0, 1000]), [chartData]);
  const featureDomain = useMemo(() => createDomain(chartData.map(p => p.featureScore), [0, 100]), [chartData]);

  const svgWidth = Math.max(chartSize.width, 1);
  const svgHeight = Math.max(chartSize.height, 1);
  const plotWidth = Math.max(svgWidth - CHART_MARGIN.left - CHART_MARGIN.right, 1);
  const plotHeight = Math.max(svgHeight - CHART_MARGIN.top - CHART_MARGIN.bottom, 1);
  const exchangeRate = rates?.[currency] ?? 1;

  const positionedData = useMemo<PositionedDatum[]>(() => {
    if (chartData.length === 0) return [];

    const reviewCounts = chartData.map(p => Math.max(p.reviewCount, 0));
    const reviewMin = Math.min(...reviewCounts);
    const reviewMax = Math.max(...reviewCounts);
    const reviewMinSqrt = Math.sqrt(reviewMin);
    const reviewMaxSqrt = Math.sqrt(reviewMax);

    const radiusForReviews = (count: number) => {
      if (reviewMinSqrt === reviewMaxSqrt) return 14;
      const ratio = (Math.sqrt(Math.max(count, 0)) - reviewMinSqrt) / (reviewMaxSqrt - reviewMinSqrt);
      return 8 + ratio * 16;
    };

    return chartData.map(product => ({
      ...product,
      color: getColorByValue(product.valueScore),
      radius: radiusForReviews(product.reviewCount),
      x: scaleLinear(product.price, priceDomain, [CHART_MARGIN.left, CHART_MARGIN.left + plotWidth]),
      y: scaleLinear(product.featureScore, featureDomain, [CHART_MARGIN.top + plotHeight, CHART_MARGIN.top]),
    }));
  }, [chartData, featureDomain, plotHeight, plotWidth, priceDomain]);

  const xTicks = useMemo(() => createTicks(priceDomain, svgWidth < 520 ? 4 : 5), [priceDomain, svgWidth]);
  const yTicks = useMemo(() => createTicks(featureDomain, svgHeight < 420 ? 4 : 5), [featureDomain, svgHeight]);

  const activeProduct = useMemo(() => positionedData.find(p => p.id === activeProductId) ?? null, [activeProductId, positionedData]);

  const tooltipPosition = useMemo(() => {
    if (!activeProduct) return null;
    const preferredLeft = activeProduct.x + 16;
    const preferredTop = activeProduct.y - TOOLTIP_HEIGHT - 16;
    const fallbackTop = activeProduct.y + 16;

    return {
      left: clamp(preferredLeft, 12, Math.max(12, svgWidth - TOOLTIP_WIDTH - 12)),
      top: preferredTop >= 12 ? preferredTop : clamp(fallbackTop, 12, Math.max(12, svgHeight - TOOLTIP_HEIGHT - 12)),
    };
  }, [activeProduct, svgHeight, svgWidth]);

  const handlePointClick = useCallback((product: ChartDatum) => {
    navigateToProduct(product);
  }, [navigateToProduct]);

  const handlePointFocus = useCallback((productId: string | null) => {
    setHighlightedProductId(productId);
    setActiveProductId(productId);
  }, [setHighlightedProductId]);

  return (
    <div className="bg-base-200 p-4 rounded-box h-[600px] w-full">
      <div ref={chartContainerRef} className="relative h-full w-full" onMouseLeave={() => handlePointFocus(null)}>
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-base-content/60">
            {t('scatterPlot.empty')}
          </div>
        ) : (
          <>
            <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} role="img" aria-label={`${t('scatterPlot.xAxis')} vs ${t('scatterPlot.yAxis')}`} className="block text-base-content/60">
              {xTicks.map((tick) => {
                const x = scaleLinear(tick, priceDomain, [CHART_MARGIN.left, CHART_MARGIN.left + plotWidth]);
                return (
                  <g key={`x-tick-${tick}`}>
                    <line x1={x} y1={CHART_MARGIN.top} x2={x} y2={CHART_MARGIN.top + plotHeight} stroke="currentColor" opacity={0.12} />
                    <line x1={x} y1={CHART_MARGIN.top + plotHeight} x2={x} y2={CHART_MARGIN.top + plotHeight + 6} stroke="currentColor" opacity={0.45} />
                    <text x={x} y={svgHeight - 28} textAnchor="middle" fill="currentColor" fontSize="11">{formatPrice(tick / exchangeRate)}</text>
                  </g>
                );
              })}
              {yTicks.map((tick) => {
                const y = scaleLinear(tick, featureDomain, [CHART_MARGIN.top + plotHeight, CHART_MARGIN.top]);
                return (
                  <g key={`y-tick-${tick}`}>
                    <line x1={CHART_MARGIN.left} y1={y} x2={CHART_MARGIN.left + plotWidth} y2={y} stroke="currentColor" opacity={0.12} />
                    <line x1={CHART_MARGIN.left - 6} y1={y} x2={CHART_MARGIN.left} y2={y} stroke="currentColor" opacity={0.45} />
                    <text x={CHART_MARGIN.left - 12} y={y + 4} textAnchor="end" fill="currentColor" fontSize="11">{formatFeatureTick(tick)}</text>
                  </g>
                );
              })}
              <line x1={CHART_MARGIN.left} y1={CHART_MARGIN.top + plotHeight} x2={CHART_MARGIN.left + plotWidth} y2={CHART_MARGIN.top + plotHeight} stroke="currentColor" opacity={0.45} />
              <line x1={CHART_MARGIN.left} y1={CHART_MARGIN.top} x2={CHART_MARGIN.left} y2={CHART_MARGIN.top + plotHeight} stroke="currentColor" opacity={0.45} />
              {activeProduct && (
                <>
                  <line x1={activeProduct.x} y1={CHART_MARGIN.top} x2={activeProduct.x} y2={CHART_MARGIN.top + plotHeight} stroke="currentColor" opacity={0.25} strokeDasharray="4 4" />
                  <line x1={CHART_MARGIN.left} y1={activeProduct.y} x2={CHART_MARGIN.left + plotWidth} y2={activeProduct.y} stroke="currentColor" opacity={0.25} strokeDasharray="4 4" />
                </>
              )}
              {positionedData.map((product) => {
                const isHighlighted = highlightedProductId === product.id;
                const isDimmed = highlightedProductId !== null && !isHighlighted;
                return (
                  <g
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${product.name}, ${product.formattedPrice}, feature score ${product.featureScore}`}
                    onClick={() => handlePointClick(product)}
                    onMouseEnter={() => handlePointFocus(product.id)}
                    onFocus={() => handlePointFocus(product.id)}
                    onBlur={() => handlePointFocus(null)}
                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handlePointClick(product); } }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx={product.x} cy={product.y} r={product.radius + 4} fill={product.color} opacity={isHighlighted ? 0.18 : 0} />
                    <circle cx={product.x} cy={product.y} r={product.radius} fill={product.color} opacity={isDimmed ? 0.2 : 0.8} stroke={isHighlighted ? '#ffffff' : 'transparent'} strokeWidth={2} />
                    <title>{`${product.name} - ${product.formattedPrice}`}</title>
                  </g>
                );
              })}
              <text x={CHART_MARGIN.left + plotWidth / 2} y={svgHeight - 8} textAnchor="middle" fill="currentColor" fontSize="12">{t('scatterPlot.xAxis')}</text>
              <text x={22} y={CHART_MARGIN.top + plotHeight / 2} textAnchor="middle" fill="currentColor" fontSize="12" transform={`rotate(-90 22 ${CHART_MARGIN.top + plotHeight / 2})`}>{t('scatterPlot.yAxis')}</text>
              <text x={CHART_MARGIN.left + plotWidth} y={16} textAnchor="end" fill="currentColor" fontSize="11" opacity={0.75}>{t('scatterPlot.bubbleSizeNote')}</text>
            </svg>
            {activeProduct && tooltipPosition && (
              <div className="pointer-events-none absolute z-10" style={{ left: tooltipPosition.left, top: tooltipPosition.top, width: TOOLTIP_WIDTH }}>
                <TooltipCard product={activeProduct} featureScoreLabel={t('scatterPlot.yAxis')} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductMap;
