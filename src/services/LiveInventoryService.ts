import { liveVisitorsSignal, totalOnlineUsersSignal, liveOrdersLastHourSignal } from "../signals/inventory.signals";

export class LiveInventoryService {
    private interval: any = null;

    constructor() {
        this.startSimulating();
    }

    /**
     * Simulates real-time updates (as if coming from WebSockets/Pusher).
     */
    private startSimulating() {
        if (this.interval) return;

        this.interval = setInterval(() => {
            // Randomly fluctuate online users
            const currentUsers = totalOnlineUsersSignal.value;
            totalOnlineUsersSignal.value = Math.max(100, currentUsers + Math.floor(Math.random() * 11) - 5);

            // Fluctuate orders last hour
            if (Math.random() > 0.8) {
                liveOrdersLastHourSignal.value += 1;
                setTimeout(() => { liveOrdersLastHourSignal.value -= 1; }, 5000);
            }
        }, 3000);
    }

    /**
     * Gets or generates a realistic visitor count for a product.
     */
    getLiveVisitors(productId: string): number {
        if (!liveVisitorsSignal.value[productId]) {
            // Generate a random seed based on product ID
            const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const base = (seed % 15) + 3; // 3 to 18 base visitors
            liveVisitorsSignal.value = { ...liveVisitorsSignal.value, [productId]: base };
        }
        
        // Randomly fluctuate
        const current = liveVisitorsSignal.value[productId];
        const next = Math.max(1, current + (Math.random() > 0.5 ? 1 : -1));
        
        if (Math.random() > 0.7) {
            liveVisitorsSignal.value = { ...liveVisitorsSignal.value, [productId]: next };
        }

        return liveVisitorsSignal.value[productId];
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}
