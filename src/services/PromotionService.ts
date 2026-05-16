import { signal, computed } from "@preact/signals-react";
import type { Product } from "../types";

export interface FlashSale {
    id: string;
    productId: string;
    discountPercent: number;
    endTime: number; // Timestamp
    title: string;
}

export const flashSalesSignal = signal<FlashSale[]>([]);

// Derived signal for active sales
export const activeFlashSalesSignal = computed(() => {
    const now = Date.now();
    return flashSalesSignal.value.filter(sale => sale.endTime > now);
});

export class PromotionService {
    /**
     * Starts a flash sale for a specific product.
     */
    startFlashSale(productId: string, discountPercent: number, durationHours: number, title: string = "Flash Sale") {
        const endTime = Date.now() + (durationHours * 60 * 60 * 1000);
        const newSale: FlashSale = {
            id: crypto.randomUUID(),
            productId,
            discountPercent,
            endTime,
            title
        };

        flashSalesSignal.value = [...flashSalesSignal.value, newSale];
    }

    /**
     * Calculates the discounted price for a product if it's on sale.
     */
    getDiscountedPrice(product: Product, basePrice: number): number {
        const activeSale = activeFlashSalesSignal.value.find(s => s.productId === product.id);
        if (activeSale) {
            return basePrice * (1 - (activeSale.discountPercent / 100));
        }
        return basePrice;
    }

    /**
     * Returns the time remaining for a flash sale in a human-readable format.
     */
    getTimeRemaining(endTime: number): string {
        const now = Date.now();
        const diff = endTime - now;
        if (diff <= 0) return "00:00:00";

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}
