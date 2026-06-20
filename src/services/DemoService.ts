import { usersSignal, ordersSignal } from "../signals/data.signals";
import { NotificationService } from "./NotificationService";

export class DemoService {
    /**
     * Generates a massive amount of demo data for presentation.
     */
    generateDemoData() {
        NotificationService.success("Generando datos de demostración...");

        // Generate 50 Users
        const demoUsers = Array.from({ length: 50 }).map((_, i) => ({
            id: `demo-u-${i}`,
            name: `Demo User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: i % 10 === 0 ? 'admin' : (i % 5 === 0 ? 'retailer' : 'user'),
            status: 'active',
            avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
            favorites: [],
            addresses: [],
            paymentMethods: []
        }));

        // Generate 100 Orders
        const demoOrders = Array.from({ length: 100 }).map((_, i) => ({
            id: `ORD-DEMO-${1000 + i}`,
            userId: `demo-u-${i % 50}`,
            items: [
                { productId: 'p1', name: 'Premium Chipset', quantity: 1, price: 299, imageUrl: '' }
            ],
            total: Math.floor(Math.random() * 5000) + 100,
            status: ['Processing', 'Shipped to Hub', 'Delivered'][i % 3],
            date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            shippingAddress: '123 Demo St, Virtual City'
        }));

        // Update Signals
        usersSignal.value = [...usersSignal.value, ...demoUsers as any];
        ordersSignal.value = [...ordersSignal.value, ...demoOrders as any];

        NotificationService.success("¡Datos de demostración generados!");
    }

    clearDemoData() {
        window.location.reload(); // Simplest way for this mock env
    }
}
