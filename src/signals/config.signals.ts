import { signal } from "@preact/signals-react";
import type { Currency, Rates } from "../types";

export type Language = 'en' | 'es';

export const languageSignal = signal<Language>('es');
export const translationsSignal = signal<Record<string, string>>({});

export const currencySignal = signal<Currency>('USD');
export interface CurrencyRateMetadata {
    source: 'banxico_sie' | 'cache' | 'fallback';
    series: string;
    baseUsdMxnRate: number;
    effectiveUsdMxnRate: number;
    markup: number;
    observedAt?: string;
    fetchedAt: string;
    stale: boolean;
    warning?: string;
}

export const ratesSignal = signal<Rates>({ USD: 1, MXN: 20 });
export const currencyErrorSignal = signal<string | null>(null);
export const isCurrencyLoadingSignal = signal<boolean>(false);

// Operational Config
const readStoredConfig = (): Record<string, number> => {
    try {
        const parsed = JSON.parse(localStorage.getItem('ep_config') || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        localStorage.removeItem('ep_config');
        return {};
    }
};

const savedConfig = readStoredConfig();
export const taxRateSignal = signal<number>(savedConfig.taxRate ?? 0.12);
export const baseShippingFeeSignal = signal<number>(savedConfig.baseShippingFee ?? 5.99);
export const freeShippingThresholdSignal = signal<number>(savedConfig.freeShippingThreshold ?? 100);
export const platformCommissionSignal = signal<number>(savedConfig.platformCommission ?? 0.15);
export const exchangeRateMarkupSignal = signal<number>(savedConfig.exchangeRateMarkup ?? 0.02);
export const currencyRateMetadataSignal = signal<CurrencyRateMetadata | null>(null);

export const isMaintenanceModeSignal = signal<boolean>(localStorage.getItem('ep_maintenance') === 'true');
export const apiStatusSignal = signal<Record<string, 'online' | 'offline'>>({
    pocketbase: 'online',
    gemini: 'online',
    onesignal: 'online'
});
