import { 
    priceRangeSignal, minRatingSignal, 
    smartFilterValuesSignal, sortOptionSignal, dealsOnlySignal, BASE_MAX_PRICE 
} from "../signals/filter.signals";
import { productsSignal } from "../signals/data.signals";
import { ratesSignal, currencySignal } from "../signals/config.signals";
import { Product } from "../types";
import { computed } from "@preact/signals-react";
import { getIndexedTotalStock } from "../utils/productIndex";

export class FilterService {
    static isDeal(p: Product) {
        const bestPrice = p.wholesalerStock.length > 0 ? Math.min(...p.wholesalerStock.map(px => px.price)) : null;
        if (!p.priceHistory || p.priceHistory.length < 2 || !bestPrice) return false;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentHistory = p.priceHistory.filter(h => new Date(h.date) >= thirtyDaysAgo);
        
        if (recentHistory.length < 2) return false;
        const maxRecentPrice = Math.max(...recentHistory.map(h => h.price));
        return bestPrice < maxRecentPrice * 0.9;
    }

    static filteredProducts = computed(() => {
        const products = productsSignal.value;
        const priceRange = priceRangeSignal.value;
        const minRating = minRatingSignal.value;
        const dealsOnly = dealsOnlySignal.value;
        const smartFilterValues = smartFilterValuesSignal.value;
        const rates = ratesSignal.value;
        const currency = currencySignal.value;

        if (!rates || !currency) return [];

        const priceRangeInBaseCurrency: [number, number] = [
            priceRange[0] / rates[currency], 
            priceRange[1] / rates[currency]
        ];

        return products.filter(p => {
            if (getIndexedTotalStock(p) <= 0) return false;

            const bestPrice = p.wholesalerStock.length > 0 ? Math.min(...p.wholesalerStock.map(px => px.price)) : null;
            if (bestPrice === null) return false;

            const priceMatch = bestPrice >= priceRangeInBaseCurrency[0] && bestPrice <= priceRangeInBaseCurrency[1];
            const ratingMatch = p.avgRating >= minRating;
            const dealsMatch = !dealsOnly || this.isDeal(p);

            const smartFiltersMatch = Object.entries(smartFilterValues).every(([key, value]) => {
                if (Array.isArray(value)) {
                    if (value.length === 0) return true;
                    const productValue = p[key as keyof Product] as string;
                    return productValue ? value.includes(productValue) : false;
                } else {
                    const specValue = p.specs[key];
                    if (specValue === undefined || specValue === null || specValue === '') {
                        return false;
                    }
                    const numericSpecValue = Number(specValue);
                    return Number.isFinite(numericSpecValue) && numericSpecValue >= (value as number);
                }
            });

            return priceMatch && ratingMatch && smartFiltersMatch && dealsMatch;
        });
    });

    static sortedProducts = computed(() => {
        const products = this.filteredProducts.value;
        const sortOption = sortOptionSignal.value;

        return [...products].sort((a, b) => {
            const priceA = a.wholesalerStock.length > 0 ? Math.min(...a.wholesalerStock.map(p => p.price)) : Infinity;
            const priceB = b.wholesalerStock.length > 0 ? Math.min(...b.wholesalerStock.map(p => p.price)) : Infinity;
            switch (sortOption) {
                case 'price-asc': return priceA - priceB;
                case 'price-desc': return priceB - priceA;
                case 'rating-desc': return b.avgRating - a.avgRating;
                case 'relevance':
                default: return b.reviewCount - a.reviewCount;
            }
        });
    });

    static activeFilterCount = computed(() => {
        let count = 0;
        const rates = ratesSignal.value;
        const currency = currencySignal.value;
        const priceRange = priceRangeSignal.value;
        const minRating = minRatingSignal.value;
        const dealsOnly = dealsOnlySignal.value;
        const smartFilterValues = smartFilterValuesSignal.value;

        const maxPrice = rates && currency ? Math.ceil(BASE_MAX_PRICE * rates[currency]) : BASE_MAX_PRICE;
        
        if (priceRange[1] < maxPrice) count += 1;
        if (minRating > 0) count += 1;
        if (dealsOnly) count += 1;
        count += Object.values(smartFilterValues).filter((value) => Array.isArray(value) ? value.length > 0 : (value as number) > 0).length;
        
        return count;
    });

    static resetFilters() {
        const rates = ratesSignal.value;
        const currency = currencySignal.value;
        const maxPrice = rates && currency ? Math.ceil(BASE_MAX_PRICE * rates[currency]) : BASE_MAX_PRICE;
        
        priceRangeSignal.value = [0, maxPrice];
        minRatingSignal.value = 0;
        dealsOnlySignal.value = false;
        smartFilterValuesSignal.value = {};
    }
}
