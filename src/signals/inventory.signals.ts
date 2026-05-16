import { signal } from "@preact/signals-react";

// Real-time visitor counts per product
export const liveVisitorsSignal = signal<Record<string, number>>({});

// Stock alerts for "Low Stock" pressure
export const lowStockAlertsSignal = signal<string[]>([]);

// Global system metrics
export const liveOrdersLastHourSignal = signal<number>(12);

export const totalOnlineUsersSignal = signal<number>(142);
