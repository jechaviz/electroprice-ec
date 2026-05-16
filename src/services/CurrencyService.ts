import { currencySignal, ratesSignal, currencyErrorSignal, isCurrencyLoadingSignal } from "../signals/config.signals";
import type { Currency, Rates } from "../types";

const FALLBACK_RATES: Rates = { USD: 1, MXN: 18 };

export class CurrencyService {
    static formatPrice(priceInUsd: number) {
        if (currencyErrorSignal.value) {
            return 'N/A';
        }

        const currency = currencySignal.value;
        const activeRates = ratesSignal.value ?? FALLBACK_RATES;
        const convertedPrice = priceInUsd * activeRates[currency];
        
        return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-MX', {
            style: 'currency',
            currency: currency,
        }).format(convertedPrice);
    }

    static setCurrency(curr: Currency) {
        currencySignal.value = curr;
    }

    static async fetchRates() {
        isCurrencyLoadingSignal.value = true;
        currencyErrorSignal.value = null;
        try {
            // Placeholder for real API fetch
            ratesSignal.value = FALLBACK_RATES;
        } catch (e) {
            currencyErrorSignal.value = "Failed to fetch rates";
            ratesSignal.value = FALLBACK_RATES;
        } finally {
            isCurrencyLoadingSignal.value = false;
        }
    }
}
