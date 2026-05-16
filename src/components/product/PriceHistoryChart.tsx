import React from 'react';
import type { PriceHistory } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';
import Spinner from '../common/Spinner';

interface PriceHistoryChartProps {
  data: PriceHistory[];
  compact?: boolean;
}

const CHART_WIDTH = 720;
const DEFAULT_CHART_HEIGHT = 300;
const DEFAULT_CHART_PADDING = {
  top: 16,
  right: 20,
  bottom: 42,
  left: 84,
};
const COMPACT_CHART_HEIGHT = 180;
const COMPACT_CHART_PADDING = {
  top: 12,
  right: 14,
  bottom: 32,
  left: 72,
};

const getLocale = (currency: 'USD' | 'MXN') => (currency === 'USD' ? 'en-US' : 'es-MX');

const formatDateLabel = (value: string, locale: string) => {
  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(parsedDate);
};

const buildTickIndices = (pointCount: number, targetTicks: number) => {
  if (pointCount <= 0) {
    return [];
  }

  if (pointCount === 1) {
    return [0];
  }

  const safeTickCount = Math.min(pointCount, Math.max(2, targetTicks));
  const indices = new Set<number>();
  const step = (pointCount - 1) / (safeTickCount - 1);

  for (let tickIndex = 0; tickIndex < safeTickCount; tickIndex += 1) {
    indices.add(Math.round(tickIndex * step));
  }

  return Array.from(indices).sort((left, right) => left - right);
};

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data, compact = false }) => {
  const { t } = useTranslation();
  const { currency, rates, loading } = useCurrency();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const gradientId = React.useId();
  const chartHeight = compact ? COMPACT_CHART_HEIGHT : DEFAULT_CHART_HEIGHT;
  const chartPadding = compact ? COMPACT_CHART_PADDING : DEFAULT_CHART_PADDING;

  React.useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return undefined;
    }

    const updateWidth = () => {
      setContainerWidth(node.getBoundingClientRect().width);
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (loading || !rates || !currency) {
    return (
      <div className={`${compact ? 'h-full min-h-[220px] p-4' : 'h-[384px] p-6'} bg-base-200 rounded-lg shadow-xl flex items-center justify-center overflow-hidden`}>
        <Spinner />
      </div>
    );
  }

  const locale = getLocale(currency);
  const rate = rates[currency] ?? 1;
  const convertedData = data
    .map((item) => ({
      ...item,
      price: item.price * rate,
    }))
    .filter((item) => Number.isFinite(item.price));

  const emptyStateLabel =
    t('priceHistory.empty') === 'priceHistory.empty'
      ? 'No price history available.'
      : t('priceHistory.empty');

  const formatAxisPrice = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const formatTooltipPrice = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);

  const plotWidth = CHART_WIDTH - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = Number.NEGATIVE_INFINITY;

  convertedData.forEach((item) => {
    if (item.price < minPrice) {
      minPrice = item.price;
    }

    if (item.price > maxPrice) {
      maxPrice = item.price;
    }
  });

  const priceSpread = convertedData.length > 0 ? maxPrice - minPrice : 0;
  const padding = priceSpread > 0 ? Math.max(priceSpread * 0.12, 20) : Math.max((maxPrice || 0) * 0.05, 20);
  const domainMin = convertedData.length > 0 ? Math.max(0, minPrice - padding) : 0;
  const domainMax = convertedData.length > 0 ? maxPrice + padding : 1;
  const domainRange = Math.max(domainMax - domainMin, 1);

  const chartPoints = convertedData.map((item, index) => {
    const x =
      convertedData.length === 1
        ? chartPadding.left + plotWidth / 2
        : chartPadding.left + (index / (convertedData.length - 1)) * plotWidth;
    const normalizedPrice = (item.price - domainMin) / domainRange;
    const y = chartPadding.top + plotHeight - normalizedPrice * plotHeight;

    return {
      ...item,
      x,
      y,
      formattedDate: formatDateLabel(item.date, locale),
      formattedPrice: formatTooltipPrice(item.price),
    };
  });

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const areaPath =
    chartPoints.length > 0
      ? `${linePath} L ${chartPoints[chartPoints.length - 1].x.toFixed(2)} ${(chartPadding.top + plotHeight).toFixed(2)} L ${chartPoints[0].x.toFixed(2)} ${(chartPadding.top + plotHeight).toFixed(2)} Z`
      : '';

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const value = domainMax - ratio * domainRange;
    const y = chartPadding.top + ratio * plotHeight;

    return {
      key: `${index}-${value}`,
      value,
      y,
      label: formatAxisPrice(value),
    };
  });

  const targetXTicks = compact
    ? containerWidth > 520 ? 4 : 3
    : containerWidth > 640 ? 6 : containerWidth > 480 ? 5 : containerWidth > 360 ? 4 : 3;
  const xTickIndices = buildTickIndices(chartPoints.length, targetXTicks);
  const xTicks = xTickIndices.map((index) => chartPoints[index]);
  const hoveredPoint = hoveredIndex === null ? null : chartPoints[hoveredIndex] ?? null;

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (chartPoints.length === 0) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();

    if (bounds.width === 0) {
      return;
    }

    const relativeX = ((event.clientX - bounds.left) / bounds.width) * CHART_WIDTH;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    chartPoints.forEach((point, index) => {
      const distance = Math.abs(point.x - relativeX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setHoveredIndex(closestIndex);
  };

  const tooltipWidth = 168;
  const tooltipLeft =
    hoveredPoint && containerWidth > 0
      ? Math.min(
          Math.max((hoveredPoint.x / CHART_WIDTH) * containerWidth - tooltipWidth / 2, 8),
          Math.max(containerWidth - tooltipWidth - 8, 8),
        )
      : 0;

  return (
    <div
      data-price-history-chart={compact ? 'compact' : 'full'}
      className={`${compact ? 'h-full p-4 flex flex-col' : 'p-6'} bg-base-200 rounded-lg shadow-xl overflow-hidden min-w-0`}
    >
      {!compact && <h3 className="text-2xl font-bold mb-3">{t('priceHistory.title')}</h3>}
      <div className={`${compact ? 'mb-2 text-xs' : 'mb-4 text-sm'} flex items-center gap-3 text-base-content/70 shrink-0`}>
        <span className={`${compact ? 'w-6' : 'w-8'} inline-block h-0.5 rounded-full bg-fuchsia-500`} />
        <span>{t('priceHistory.legend')}</span>
      </div>
      <div ref={containerRef} className={`${compact ? 'min-h-0 flex-1' : 'h-[300px]'} relative w-full min-w-0 overflow-hidden`}>
        {chartPoints.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-base-300/60 border-dashed text-sm text-base-content/60">
            {emptyStateLabel}
          </div>
        ) : (
          <>
            <svg
              className="h-full w-full overflow-hidden"
              viewBox={`0 0 ${CHART_WIDTH} ${chartHeight}`}
              role="img"
              aria-label={t('priceHistory.title')}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d946ef" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#d946ef" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {yTicks.map((tick) => (
                <g key={tick.key}>
                  <line
                    x1={chartPadding.left}
                    x2={chartPadding.left + plotWidth}
                    y1={tick.y}
                    y2={tick.y}
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartPadding.left - 10}
                    y={tick.y + 4}
                    fill="currentColor"
                    fillOpacity="0.65"
                    fontSize={compact ? '10' : '12'}
                    textAnchor="end"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              <line
                x1={chartPadding.left}
                x2={chartPadding.left}
                y1={chartPadding.top}
                y2={chartPadding.top + plotHeight}
                stroke="currentColor"
                strokeOpacity="0.25"
              />
              <line
                x1={chartPadding.left}
                x2={chartPadding.left + plotWidth}
                y1={chartPadding.top + plotHeight}
                y2={chartPadding.top + plotHeight}
                stroke="currentColor"
                strokeOpacity="0.25"
              />

              {xTicks.map((tick) => (
                <g key={`${tick.date}-${tick.x}`}>
                  <line
                    x1={tick.x}
                    x2={tick.x}
                    y1={chartPadding.top + plotHeight}
                    y2={chartPadding.top + plotHeight + 6}
                    stroke="currentColor"
                    strokeOpacity="0.35"
                  />
                  <text
                    x={tick.x}
                    y={chartPadding.top + plotHeight + (compact ? 20 : 24)}
                    fill="currentColor"
                    fillOpacity="0.65"
                    fontSize={compact ? '10' : '12'}
                    textAnchor="middle"
                  >
                    {tick.formattedDate}
                  </text>
                </g>
              ))}

              <path d={areaPath} fill={`url(#${gradientId})`} />
              <path
                d={linePath}
                fill="none"
                stroke="#d946ef"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {chartPoints.length <= 24 &&
                chartPoints.map((point) => (
                  <circle
                    key={`${point.date}-${point.price}`}
                    cx={point.x}
                    cy={point.y}
                    r="2.5"
                    fill="#f5d0fe"
                    stroke="#d946ef"
                    strokeWidth="1"
                  />
                ))}

              {hoveredPoint && (
                <>
                  <line
                    x1={hoveredPoint.x}
                    x2={hoveredPoint.x}
                    y1={chartPadding.top}
                    y2={chartPadding.top + plotHeight}
                    stroke="#f0abfc"
                    strokeOpacity="0.45"
                    strokeDasharray="5 4"
                  />
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="6"
                    fill="#fdf4ff"
                    stroke="#d946ef"
                    strokeWidth="3"
                  />
                </>
              )}
            </svg>

            {hoveredPoint && (
              <div
                className="pointer-events-none absolute top-3 rounded-lg border border-base-300/80 bg-base-100/95 px-3 py-2 text-sm shadow-lg backdrop-blur"
                style={{ left: `${tooltipLeft}px`, width: `${tooltipWidth}px` }}
              >
                <div className="font-medium">{hoveredPoint.formattedDate}</div>
                <div className="text-base-content/70">{t('priceHistory.legend')}</div>
                <div className="mt-1 font-semibold text-fuchsia-500">{hoveredPoint.formattedPrice}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PriceHistoryChart;
