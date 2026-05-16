import { signal, computed } from "@preact/signals-react";

export type AnalyticsEventType = 
    | 'page_view' 
    | 'product_view' 
    | 'add_to_cart' 
    | 'checkout_start' 
    | 'purchase_success' 
    | 'campaign_click'
    | 'ai_action';

export interface AnalyticsEvent {
    id: string;
    type: AnalyticsEventType;
    timestamp: number;
    userId?: string;
    metadata: Record<string, any>;
}

// Raw event store
export const analyticsEventsSignal = signal<AnalyticsEvent[]>([]);

// Real-time computed metrics
export const totalPageViewsSignal = computed(() => 
    analyticsEventsSignal.value.filter(e => e.type === 'page_view').length
);

export const conversionRateSignal = computed(() => {
    const views = analyticsEventsSignal.value.filter(e => e.type === 'product_view').length;
    const purchases = analyticsEventsSignal.value.filter(e => e.type === 'purchase_success').length;
    return views > 0 ? (purchases / views) * 100 : 0;
});

export const revenueTrendSignal = computed(() => {
    // Group purchases by last 24h for simple trend
    const now = Date.now();
    const last24h = analyticsEventsSignal.value.filter(e => 
        e.type === 'purchase_success' && e.timestamp > (now - 24 * 60 * 60 * 1000)
    );
    return last24h.reduce((sum, e) => sum + (e.metadata.total || 0), 0);
});

export const activeUsersSignal = signal<number>(0);
