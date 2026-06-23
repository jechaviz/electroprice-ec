import { signal } from "@preact/signals-react";
import { SortOption } from "../types";

// Price-filter ceiling in the base currency (MXN). Scaled to the display currency
// via the active rates in the filter UI.
export const BASE_MAX_PRICE = 60000;

export const viewModeSignal = signal<'grid' | 'table' | 'map'>('grid');
export const priceRangeSignal = signal<[number, number]>([0, BASE_MAX_PRICE]);
export const minRatingSignal = signal<number>(0);
export const smartFilterValuesSignal = signal<Record<string, number | string[]>>({});
export const sortOptionSignal = signal<SortOption>('relevance');
export const dealsOnlySignal = signal<boolean>(false);
