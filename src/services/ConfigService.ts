import { taxRateSignal, baseShippingFeeSignal, platformCommissionSignal, isMaintenanceModeSignal } from "../signals/config.signals";

export class ConfigService {
    /**
     * Updates operational parameters.
     */
    updateConfig(config: { 
        taxRate?: number, 
        baseShippingFee?: number, 
        platformCommission?: number 
    }) {
        if (config.taxRate !== undefined) taxRateSignal.value = config.taxRate;
        if (config.baseShippingFee !== undefined) baseShippingFeeSignal.value = config.baseShippingFee;
        if (config.platformCommission !== undefined) platformCommissionSignal.value = config.platformCommission;

        localStorage.setItem('ep_config', JSON.stringify({
            taxRate: taxRateSignal.value,
            baseShippingFee: baseShippingFeeSignal.value,
            platformCommission: platformCommissionSignal.value
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
