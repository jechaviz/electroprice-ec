import {
    currencySignal,
    ratesSignal,
    currencyErrorSignal,
    isCurrencyLoadingSignal,
    exchangeRateMarkupSignal,
    currencyRateMetadataSignal,
    CURRENCY_STORAGE_KEY,
    type CurrencyRateMetadata,
} from "../signals/config.signals";
import type { Currency, Rates } from "../types";

const FALLBACK_USD_MXN_RATE = 18;
const BANXICO_FIX_SERIES = 'SF43718';
const RATE_CACHE_KEY = 'ep_banxico_usd_mxn_rate';
const RATE_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface BanxicoRatePayload {
    value: number;
    observedAt?: string;
    fetchedAt?: string;
    source?: 'banxico_sie';
    series?: string;
}

// Catalog prices are MXN, so MXN is the base (rate 1) and USD = 1/(USD→MXN).
const mxnBaseRates = (usdMxnRate: number): Rates => ({
    MXN: 1,
    USD: Number((1 / usdMxnRate).toFixed(6)),
});

const fallbackRates = (): Rates => mxnBaseRates(effectiveRate(FALLBACK_USD_MXN_RATE));

const effectiveRate = (baseUsdMxnRate: number) =>
    Number((baseUsdMxnRate * (1 + exchangeRateMarkupSignal.value)).toFixed(6));

const rateEndpoint = () => {
    const pocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL || (import.meta.env.PROD ? '/pb' : 'http://127.0.0.1:8090');
    return import.meta.env.VITE_BANXICO_RATE_ENDPOINT || `${pocketBaseUrl.replace(/\/$/, '')}/api/electroprice/rates/usd-mxn`;
};

const parseRateValue = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
    if (typeof value !== 'string') return null;

    const parsed = Number(value.replace(',', '').trim());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const readCachedRate = (): BanxicoRatePayload | null => {
    try {
        const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || 'null') as BanxicoRatePayload | null;
        const rate = parseRateValue(cached?.value);
        if (!cached || !rate || !cached.fetchedAt) return null;

        const age = Date.now() - new Date(cached.fetchedAt).getTime();
        if (!Number.isFinite(age) || age > RATE_CACHE_MAX_AGE_MS) return null;

        return { ...cached, value: rate };
    } catch {
        return null;
    }
};

const writeCachedRate = (payload: BanxicoRatePayload) => {
    try {
        localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Non-critical: private mode or storage quota should not block pricing.
    }
};

const applyRate = (baseUsdMxnRate: number, metadata: Omit<CurrencyRateMetadata, 'baseUsdMxnRate' | 'effectiveUsdMxnRate' | 'markup'>) => {
    const nextEffectiveRate = effectiveRate(baseUsdMxnRate);
    ratesSignal.value = mxnBaseRates(nextEffectiveRate);
    currencyRateMetadataSignal.value = {
        ...metadata,
        baseUsdMxnRate,
        effectiveUsdMxnRate: nextEffectiveRate,
        markup: exchangeRateMarkupSignal.value,
    };
};

export class CurrencyService {
    static formatPrice(priceInMxn: number) {
        if (currencyErrorSignal.value) {
            return 'N/A';
        }

        const currency = currencySignal.value;
        const activeRates = ratesSignal.value ?? fallbackRates();
        const convertedPrice = priceInMxn * activeRates[currency];
        
        return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-MX', {
            style: 'currency',
            currency: currency,
        }).format(convertedPrice);
    }

    static setCurrency(curr: Currency) {
        currencySignal.value = curr;
        try {
            localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
        } catch {
            // Non-critical: private mode / storage quota should not block switching.
        }
    }

    static recalculateEffectiveRates() {
        const metadata = currencyRateMetadataSignal.value;
        const baseUsdMxnRate = metadata?.baseUsdMxnRate ?? FALLBACK_USD_MXN_RATE;

        applyRate(baseUsdMxnRate, {
            source: metadata?.source ?? 'fallback',
            series: metadata?.series ?? BANXICO_FIX_SERIES,
            observedAt: metadata?.observedAt,
            fetchedAt: metadata?.fetchedAt ?? new Date().toISOString(),
            stale: metadata?.stale ?? true,
            warning: metadata?.warning,
        });
    }

    static async fetchRates() {
        isCurrencyLoadingSignal.value = true;
        currencyErrorSignal.value = null;
        try {
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 4000);
            let response: Response;
            try {
                response = await fetch(rateEndpoint(), {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
            } finally {
                window.clearTimeout(timeoutId);
            }

            if (!response.ok) {
                throw new Error(`Banxico rate endpoint returned ${response.status}`);
            }

            const payload = await response.json() as BanxicoRatePayload;
            const banxicoRate = parseRateValue(payload.value);
            if (!banxicoRate) {
                throw new Error('Banxico rate endpoint returned an invalid value');
            }

            const fetchedAt = payload.fetchedAt || new Date().toISOString();
            const cachePayload = {
                value: banxicoRate,
                observedAt: payload.observedAt,
                fetchedAt,
                source: 'banxico_sie' as const,
                series: payload.series || BANXICO_FIX_SERIES,
            };

            writeCachedRate(cachePayload);
            applyRate(banxicoRate, {
                source: 'banxico_sie',
                series: cachePayload.series,
                observedAt: cachePayload.observedAt,
                fetchedAt,
                stale: false,
            });
        } catch (error) {
            const cached = readCachedRate();
            if (cached) {
                applyRate(cached.value, {
                    source: 'cache',
                    series: cached.series || BANXICO_FIX_SERIES,
                    observedAt: cached.observedAt,
                    fetchedAt: cached.fetchedAt || new Date().toISOString(),
                    stale: true,
                    warning: 'Banxico no respondió; usando el último FIX guardado.',
                });
            } else {
                applyRate(FALLBACK_USD_MXN_RATE, {
                    source: 'fallback',
                    series: BANXICO_FIX_SERIES,
                    fetchedAt: new Date().toISOString(),
                    stale: true,
                    warning: 'Banxico no respondió; usando tasa fallback auditada.',
                });
            }

            console.warn('Banxico exchange rate unavailable:', error);
        } finally {
            isCurrencyLoadingSignal.value = false;
        }
    }
}
