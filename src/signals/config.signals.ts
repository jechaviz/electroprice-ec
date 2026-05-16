import { signal } from "@preact/signals-react";
import type { Currency, Rates } from "../types";

export type Language = 'en' | 'es';

export const languageSignal = signal<Language>('es');
export const translationsSignal = signal<Record<string, string>>({});

export const currencySignal = signal<Currency>('USD');
export const ratesSignal = signal<Rates>({ USD: 1, MXN: 20 });
export const currencyErrorSignal = signal<string | null>(null);
export const isCurrencyLoadingSignal = signal<boolean>(false);

// Operational Config
const savedConfig = JSON.parse(localStorage.getItem('ep_config') || '{}');
export const taxRateSignal = signal<number>(savedConfig.taxRate ?? 0.12);
export const baseShippingFeeSignal = signal<number>(savedConfig.baseShippingFee ?? 5.99);
export const freeShippingThresholdSignal = signal<number>(savedConfig.freeShippingThreshold ?? 100);
export const platformCommissionSignal = signal<number>(savedConfig.platformCommission ?? 0.15);

export const isMaintenanceModeSignal = signal<boolean>(localStorage.getItem('ep_maintenance') === 'true');
export const apiStatusSignal = signal<Record<string, 'online' | 'offline'>>({
    pocketbase: 'online',
    gemini: 'online',
    onesignal: 'online'
});
