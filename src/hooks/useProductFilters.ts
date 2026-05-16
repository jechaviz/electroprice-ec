import { useEffect } from 'react';
import { ratesSignal, currencySignal } from '../signals/config.signals';
import { 
    viewModeSignal, priceRangeSignal, minRatingSignal, 
    smartFilterValuesSignal, sortOptionSignal, dealsOnlySignal, BASE_MAX_PRICE 
} from '../signals/filter.signals';
import { FilterService } from '../services/FilterService';
import type { SortOption } from '../types';

export { BASE_MAX_PRICE };

export const useProductFilters = () => {
  useEffect(() => {
    const rates = ratesSignal.value;
    const currency = currencySignal.value;
    if (rates && currency) {
      priceRangeSignal.value = [0, Math.ceil(BASE_MAX_PRICE * rates[currency])];
    }
  }, []);

  return {
    viewMode: viewModeSignal.value,
    setViewMode: (val: 'grid' | 'table' | 'map') => { viewModeSignal.value = val; },
    priceRange: priceRangeSignal.value,
    setPriceRange: (val: [number, number]) => { priceRangeSignal.value = val; },
    minRating: minRatingSignal.value,
    setMinRating: (val: number) => { minRatingSignal.value = val; },
    smartFilterValues: smartFilterValuesSignal.value,
    setSmartFilterValues: (val: Record<string, number | string[]>) => { smartFilterValuesSignal.value = val; },
    sortOption: sortOptionSignal.value,
    setSortOption: (val: SortOption) => { sortOptionSignal.value = val; },
    dealsOnly: dealsOnlySignal.value,
    setDealsOnly: (val: boolean) => { dealsOnlySignal.value = val; },
    sortedProducts: FilterService.sortedProducts.value,
    activeFilterCount: FilterService.activeFilterCount.value,
    resetFilters: () => FilterService.resetFilters(),
  };
};
