import { analyticsEventsSignal, AnalyticsEvent, AnalyticsEventType } from "../signals/analytics.signals";
import { currentUserSignal } from "../signals/auth.signals";

export class AnalyticsService {
    /**
     * Records a new analytics event reactively.
     * In a real production app, this would also POST to an endpoint (e.g., Mixpanel, GA4, or custom backend).
     */
    trackEvent(type: AnalyticsEventType, metadata: Record<string, any> = {}) {
        const newEvent: AnalyticsEvent = {
            id: crypto.randomUUID(),
            type,
            timestamp: Date.now(),
            userId: currentUserSignal.value?.id,
            metadata
        };

        // Update local signal for real-time dashboard updates
        analyticsEventsSignal.value = [...analyticsEventsSignal.value, newEvent];

        // Production Pattern: Buffer and flush to server
        this.flushToServer(newEvent);
    }

    private async flushToServer(_event: AnalyticsEvent) {
        // Simulated server-side tracking (e.g., PocketBase 'telemetry' collection)
        try {
            // console.log(`[Analytics] Flushed event ${event.type}`, event);
            // Example: await pb.collection('telemetry').create(event);
        } catch (error) {
            console.error("Failed to flush analytics:", error);
        }
    }

    // Specialized tracking helpers
    trackPageView(path: string) {
        this.trackEvent('page_view', { path });
    }

    trackProductView(productId: string, name: string) {
        this.trackEvent('product_view', { productId, name });
    }

    trackPurchase(orderId: string, total: number, itemCount: number) {
        this.trackEvent('purchase_success', { orderId, total, itemCount });
    }

    /**
     * Generates a conversion funnel for the Admin Dashboard.
     */
    getConversionFunnel() {
        const events = analyticsEventsSignal.value;
        return {
            views: events.filter(e => e.type === 'product_view').length,
            addToCart: events.filter(e => e.type === 'add_to_cart').length,
            checkout: events.filter(e => e.type === 'checkout_start').length,
            success: events.filter(e => e.type === 'purchase_success').length,
        };
    }
}
