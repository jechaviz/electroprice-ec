import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { ratesSignal, currencySignal } from '../signals/config.signals';
import { 
    viewModeSignal, priceRangeSignal, minRatingSignal, 
    smartFilterValuesSignal, sortOptionSignal, dealsOnlySignal, BASE_MAX_PRICE 
} from '../signals/filter.signals';
import type { SortOption } from '../types';

export { BASE_MAX_PRICE };

const getMaxPriceForCurrency = () => {
  const rates = ratesSignal.value;
  const currency = currencySignal.value;
  return rates && currency ? Math.ceil(BASE_MAX_PRICE * rates[currency]) : BASE_MAX_PRICE;
};

export const useProductFilters = () => {
  useSignals();
  const currentCurrency = currencySignal.value;
  const currentRates = ratesSignal.value;
  const viewMode = viewModeSignal.value;
  const priceRange = priceRangeSignal.value;
  const minRating = minRatingSignal.value;
  const smartFilterValues = smartFilterValuesSignal.value;
  const sortOption = sortOptionSignal.value;
  const dealsOnly = dealsOnlySignal.value;
  const previousCurrencyRef = useRef(currencySignal.value);
  const previousRatesRef = useRef(ratesSignal.value);

  const setViewMode = useCallback((val: 'grid' | 'table' | 'map') => { viewModeSignal.value = val; }, []);
  const setPriceRange = useCallback((val: [number, number]) => { priceRangeSignal.value = val; }, []);
  const setMinRating = useCallback((val: number) => { minRatingSignal.value = val; }, []);
  const setSmartFilterValues = useCallback((val: Record<string, number | string[]>) => { smartFilterValuesSignal.value = val; }, []);
  const setSortOption = useCallback((val: SortOption) => { sortOptionSignal.value = val; }, []);
  const setDealsOnly = useCallback((val: boolean) => { dealsOnlySignal.value = val; }, []);
  const resetFilters = useCallback(() => {
    priceRangeSignal.value = [0, getMaxPriceForCurrency()];
    minRatingSignal.value = 0;
    dealsOnlySignal.value = false;
    smartFilterValuesSignal.value = {};
  }, []);

  useEffect(() => {
    const rates = currentRates;
    const currency = currentCurrency;
    const previousCurrency = previousCurrencyRef.current;
    const previousRates = previousRatesRef.current;

    if (!rates || !currency) return;

    if (previousCurrency && previousRates?.[previousCurrency] && previousCurrency !== currency) {
      const previousMax = Math.ceil(BASE_MAX_PRICE * previousRates[previousCurrency]);
      const nextRate = rates[currency];
      const [currentMin, currentMax] = priceRangeSignal.value;
      const coversFullRange = currentMin <= 0 && currentMax >= previousMax;
      const nextRange: [number, number] = coversFullRange
        ? [0, Math.ceil(BASE_MAX_PRICE * nextRate)]
        : [
            Math.max(0, Math.floor((currentMin / previousRates[previousCurrency]) * nextRate)),
            Math.ceil((currentMax / previousRates[previousCurrency]) * nextRate),
          ];

      priceRangeSignal.value = nextRange;
    } else if (priceRangeSignal.value[0] === 0 && priceRangeSignal.value[1] === BASE_MAX_PRICE) {
      priceRangeSignal.value = [0, Math.ceil(BASE_MAX_PRICE * rates[currency])];
    }

    previousCurrencyRef.current = currency;
    previousRatesRef.current = rates;
  }, [currentCurrency, currentRates]);

  const activeFilterCount = useMemo(() => {
      const maxPrice = currentRates && currentCurrency ? Math.ceil(BASE_MAX_PRICE * currentRates[currentCurrency]) : BASE_MAX_PRICE;
      let count = 0;
      if (priceRange[1] < maxPrice) count += 1;
      if (minRating > 0) count += 1;
      if (dealsOnly) count += 1;
      count += Object.values(smartFilterValues).filter((value) => Array.isArray(value) ? value.length > 0 : value > 0).length;
      return count;
  }, [currentCurrency, currentRates, dealsOnly, minRating, priceRange, smartFilterValues]);

  return {
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
  };
};
