import {
    taxRateSignal,
    baseShippingFeeSignal,
    platformCommissionSignal,
    exchangeRateMarkupSignal,
    isMaintenanceModeSignal,
} from "../signals/config.signals";

export class ConfigService {
    /**
     * Updates operational parameters.
     */
    updateConfig(config: { 
        taxRate?: number, 
        baseShippingFee?: number, 
        platformCommission?: number,
        exchangeRateMarkup?: number,
    }) {
        if (config.taxRate !== undefined) taxRateSignal.value = config.taxRate;
        if (config.baseShippingFee !== undefined) baseShippingFeeSignal.value = config.baseShippingFee;
        if (config.platformCommission !== undefined) platformCommissionSignal.value = config.platformCommission;
        if (config.exchangeRateMarkup !== undefined) exchangeRateMarkupSignal.value = Math.max(0, config.exchangeRateMarkup);

        localStorage.setItem('ep_config', JSON.stringify({
            taxRate: taxRateSignal.value,
            baseShippingFee: baseShippingFeeSignal.value,
            platformCommission: platformCommissionSignal.value,
            exchangeRateMarkup: exchangeRateMarkupSignal.value,
        }));
    }

    toggleMaintenanceMode() {
        isMaintenanceModeSignal.value = !isMaintenanceModeSignal.value;
        localStorage.setItem('ep_maintenance', String(isMaintenanceModeSignal.value));
    }

    /**
     * Simulated Health Check
     */
    async checkApiStatus() {
        // Logic to ping endpoints
        return {
            pocketbase: 'online',
            gemini: 'online',
            onesignal: 'online'
        };
    }
}
