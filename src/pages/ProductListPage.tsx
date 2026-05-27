import React, { Suspense, lazy, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { ViewMode, SortOption } from '../types';
import NativeSelect from '../components/common/NativeSelect';
import Spinner from '../components/common/Spinner';
import ToggleSwitch from '../components/common/ToggleSwitch';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../contexts/CurrencyContext';
import SmartFilters from '../components/product/SmartFilters';
import { SMART_FILTER_CONFIG } from '../constants';
import { useSEO } from '../hooks/useSEO';
import { useProductFilters, BASE_MAX_PRICE } from '../hooks/useProductFilters';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteProductCatalog } from '../hooks/useInfiniteProductCatalog';
import VirtualizedProductGrid from '../components/product/VirtualizedProductGrid';
import { searchTermRequestsOutOfStock } from '../utils/productIndex';

import { useParams, useSearchParams } from 'react-router-dom';

const loadProductMapView = () => import('../components/product/ProductMapView');
const loadProductMap = () => import('../components/product/ProductMap');

const ProductMapView = lazy(loadProductMapView);
const ProductMap = lazy(loadProductMap);

type DeferredViewMode = Extract<ViewMode, 'table' | 'map'>;
const UNBOUNDED_PRICE_RANGE: [number, number] = [0, Infinity];

const DeferredViewFallback: React.FC<{ viewMode: DeferredViewMode; label: string }> = ({ viewMode, label }) => (
  <div
    className={`bg-base-200 rounded-box p-4 ${
      viewMode === 'map' ? 'h-[600px]' : 'min-h-[24rem]'
    }`}
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    <div className="flex items-center justify-center gap-3 border-b border-base-300 pb-4">
      <span className="loading loading-spinner loading-md text-primary" aria-hidden="true"></span>
      <span className="font-medium">{label}</span>
    </div>
    {viewMode === 'map' ? (
      <div className="skeleton mt-4 h-[calc(100%-4.25rem)] w-full rounded-box" aria-hidden="true"></div>
    ) : (
      <div className="mt-4 space-y-4" aria-hidden="true">
        <div className="grid grid-cols-[8rem_repeat(3,minmax(0,1fr))] gap-4">
          <div className="skeleton h-24 rounded-box"></div>
          <div className="skeleton h-24 rounded-box"></div>
          <div className="skeleton h-24 rounded-box"></div>
          <div className="skeleton h-24 rounded-box"></div>
        </div>
        <div className="skeleton h-12 w-full rounded-box"></div>
        <div className="skeleton h-12 w-full rounded-box"></div>
        <div className="skeleton h-12 w-full rounded-box"></div>
      </div>
    )}
  </div>
);

const ProductListPage: React.FC = () => {
  const { products: cachedProducts, loading, error, setCategory, setSearchTerm } = useContext(AppContext);
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');
  
  const { t } = useTranslation();
  const { currency, rates } = useCurrency();

  const searchTerm = q || '';
  const category = categoryId || '';
  const outOfStockRequestedBySearch = searchTermRequestsOutOfStock(searchTerm);
  const resultsRegionId = 'product-results-region';

  useEffect(() => {
    setCategory(categoryId ?? null);
    setSearchTerm(q ?? '');
  }, [categoryId, q, setCategory, setSearchTerm]);

  const {
    viewMode,
    setViewMode,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    smartFilterValues,
    setSmartFilterValues,
    sortOption,
    setSortOption,
    dealsOnly,
    setDealsOnly,
    activeFilterCount,
    resetFilters,
  } = useProductFilters();
  const effectiveStockFilter = outOfStockRequestedBySearch ? 'out-of-stock' : 'available';
  const maxPriceInSelectedCurrency = rates && currency ? Math.ceil(BASE_MAX_PRICE * rates[currency]) : BASE_MAX_PRICE;
  const debouncedPriceRange = useDebounce(
    priceRange[0] <= 0 && priceRange[1] >= maxPriceInSelectedCurrency ? UNBOUNDED_PRICE_RANGE : priceRange,
    250
  );
  const debouncedMinRating = useDebounce(minRating, 250);
  const debouncedSmartFilterValues = useDebounce(smartFilterValues, 250);
  const {
    products: sortedProducts,
    total: catalogTotal,
    loadingInitial: catalogLoadingInitial,
    loadingMore: catalogLoadingMore,
    hasMore: catalogHasMore,
    error: catalogError,
    loadMore,
    setSentinelNode,
  } = useInfiniteProductCatalog({
    searchTerm,
    category: category || null,
    priceRange: debouncedPriceRange,
    minRating: debouncedMinRating,
    smartFilterValues: debouncedSmartFilterValues,
    sortOption,
    dealsOnly,
    stockFilter: effectiveStockFilter,
    rates,
    currency,
  });

  useSEO({
    title: searchTerm
      ? `Results for "${searchTerm}"`
      : category
        ? `${t(`categories.${category}`) || category}`
        : 'All Products',
    description: searchTerm
      ? `Find the best prices for "${searchTerm}" across multiple wholesalers.`
      : category
        ? `Browse and compare ${t(`categories.${category}`) || category} from top wholesalers.`
        : 'Browse all electronics and compare prices from top wholesalers.',
    keywords: [searchTerm, category, 'electronics', 'price comparison'].filter(Boolean),
  });

  // Reset smart filters when the main category or search term changes
  useEffect(() => {
    setSmartFilterValues({});
  }, [searchTerm, category, setSmartFilterValues]);
  
  const getTitle = () => {
    if (searchTerm) return `${t('list.resultsTitle')} "${searchTerm}"`;
    if (category) return t('list.categoryTitle', { category: t(`categories.${category}`) });
    return t('header.nav.categories');
  }

  const preloadDeferredView = useCallback((nextViewMode: ViewMode) => {
    if (nextViewMode === 'table') {
      void loadProductMapView();
    }

    if (nextViewMode === 'map') {
      void loadProductMap();
    }
  }, []);

  const handleViewModeChange = useCallback((nextViewMode: ViewMode) => {
    preloadDeferredView(nextViewMode);
    setViewMode(nextViewMode);
  }, [preloadDeferredView, setViewMode]);

  const renderDeferredView = useCallback((nextViewMode: DeferredViewMode) => {
    const label = t(nextViewMode === 'table' ? 'list.view.table' : 'list.view.map');
    const sectionId = nextViewMode === 'table' ? 'product-table-view' : 'product-map-view';
    const comparisonProducts = sortedProducts.slice(0, 180);

    return (
      <section id={sectionId} role="region" aria-label={label}>
        <Suspense fallback={<DeferredViewFallback viewMode={nextViewMode} label={label} />}>
          {nextViewMode === 'table' ? (
            <ProductMapView products={comparisonProducts} />
          ) : (
            <ProductMap products={comparisonProducts} />
          )}
        </Suspense>
      </section>
    );
  }, [sortedProducts, t]);

  const renderCurrentView = () => {
    switch (viewMode) {
        case 'table': return renderDeferredView('table');
        case 'map': return renderDeferredView('map');
        case 'grid':
        default: return (
            <VirtualizedProductGrid products={sortedProducts} ariaLabel={t('list.view.grid')} />
        );
    }
  }

  const renderContent = () => {
    if ((loading && cachedProducts.length === 0) || (catalogLoadingInitial && sortedProducts.length === 0)) {
      return <Spinner />;
    }

    if (error || catalogError) {
      return (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body items-center text-center text-error">
            <i className="fa-solid fa-circle-xmark text-4xl mb-4"></i>
            <h2 className="card-title text-2xl">{t('list.error')}</h2>
            <p>{error || catalogError?.message}</p>
          </div>
        </div>
      );
    }

    if (sortedProducts.length > 0) {
      return renderCurrentView();
    }

    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl">{t('list.noProducts.title')}</h2>
          <p>{t('list.noProducts.subtitle')}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5 card bg-base-200 p-6 self-start">
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-base-300 pb-4">
            <h2 className="text-xl font-bold">{t('list.filters.title')}</h2>
            {activeFilterCount > 0 && (
              <button type="button" onClick={resetFilters} className="btn btn-ghost btn-xs rounded-full text-primary">
                {t('list.filters.clear')}
              </button>
            )}
          </div>
          <div className="form-control gap-4">
              <div>
                  <label className="label" htmlFor="price-range-filter"><span className="label-text">{t('list.filters.priceRange')} ({currency})</span></label>
                  <input id="price-range-filter" type="range" min={0} max={maxPriceInSelectedCurrency} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} className="range range-primary" aria-valuetext={`${priceRange[1]} ${currency}`} />
                  <div className="w-full flex justify-between text-xs px-2"><span>{0}</span><span>{maxPriceInSelectedCurrency}</span></div>
              </div>
              <div>
                  <label className="label"><span className="label-text">{t('list.filters.rating')}</span><span className="label-text-alt">{minRating.toFixed(1)}+ ★</span></label>
                  <input id="rating-filter" type="range" min="0" max="5" step="0.5" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="range range-primary" aria-valuetext={`${minRating.toFixed(1)}+`} />
              </div>
          </div>
          {category && SMART_FILTER_CONFIG[category] && <SmartFilters category={category} config={SMART_FILTER_CONFIG[category]} values={smartFilterValues} onChange={setSmartFilterValues} />}
        </aside>

        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-bold">{getTitle()}</h1>
                <p className="mt-1 text-sm font-medium text-base-content/55" aria-live="polite">
                  {t('list.resultsCount', { count: catalogTotal ?? sortedProducts.length + (catalogHasMore ? '+' : '') })}
                  {activeFilterCount > 0 ? ` · ${t('list.activeFilters', { count: activeFilterCount })}` : ''}
                </p>
              </div>
              {activeFilterCount > 0 && (
                <button type="button" onClick={resetFilters} className="btn btn-outline btn-sm rounded-full self-start sm:self-auto">
                  {t('list.filters.clearAll')}
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="form-control w-full max-w-xs">
                <label className="sr-only" htmlFor="sort-products">{t('list.sortBy')}</label>
                <NativeSelect id="sort-products" size="sm" value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)}>
                  <option value="relevance">{t('list.sortOptions.relevance')}</option>
                  <option value="price-asc">{t('list.sortOptions.price-asc')}</option>
                  <option value="price-desc">{t('list.sortOptions.price-desc')}</option>
                  <option value="rating-desc">{t('list.sortOptions.rating-desc')}</option>
                </NativeSelect>
              </div>
              <div className="form-control">
                <label className="cursor-pointer label gap-2">
                  <span className="label-text">{t('list.dealsOnly')}</span> 
                  <ToggleSwitch checked={dealsOnly} onChange={() => setDealsOnly(!dealsOnly)} tone="primary" />
                </label>
              </div>
              <div className="join self-end">
                  <button type="button" aria-label={t('list.view.grid')} aria-controls={resultsRegionId} aria-pressed={viewMode === 'grid'} title={t('list.view.grid')} className={`btn join-item ${viewMode === 'grid' ? 'btn-primary' : ''}`} onClick={() => handleViewModeChange('grid')}><i className="fa-solid fa-grip"></i></button>
                  <button type="button" aria-label={t('list.view.table')} aria-controls={resultsRegionId} aria-pressed={viewMode === 'table'} title={t('list.view.table')} className={`btn join-item ${viewMode === 'table' ? 'btn-primary' : ''}`} onClick={() => handleViewModeChange('table')} onMouseEnter={() => preloadDeferredView('table')} onFocus={() => preloadDeferredView('table')}><i className="fa-solid fa-table-list"></i></button>
                  <button type="button" aria-label={t('list.view.map')} aria-controls={resultsRegionId} aria-pressed={viewMode === 'map'} title={t('list.view.map')} className={`btn join-item ${viewMode === 'map' ? 'btn-primary' : ''}`} onClick={() => handleViewModeChange('map')} onMouseEnter={() => preloadDeferredView('map')} onFocus={() => preloadDeferredView('map')}><i className="fa-solid fa-map-location-dot"></i></button>
              </div>
            </div>
          </div>
          
          <div id={resultsRegionId} aria-busy={loading || catalogLoadingInitial || catalogLoadingMore}>
            {renderContent()}
          </div>
          <div ref={setSentinelNode} className="flex min-h-24 items-center justify-center py-6" role="status" aria-live="polite">
            {catalogLoadingMore ? (
              <span className="loading loading-spinner loading-md text-primary" aria-label={t('list.loadingMore')}></span>
            ) : catalogHasMore && sortedProducts.length > 0 ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={loadMore}>
                {t('list.loadingMore')}
              </button>
            ) : sortedProducts.length > 0 ? (
              <span className="text-xs font-semibold uppercase tracking-widest text-base-content/35">{t('list.endOfResults')}</span>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
