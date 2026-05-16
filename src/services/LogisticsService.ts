import { Order, OrderStatus } from "../types";

export interface LogisticsMilestone {
    status: OrderStatus;
    location: string;
    timestamp: string;
    description: string;
}

export class LogisticsService {
    /**
     * Generates a realistic set of logistics milestones for an order based on its current status.
     */
    getMilestones(order: Order): LogisticsMilestone[] {
        const baseDate = new Date(order.date);
        const milestones: LogisticsMilestone[] = [
            { 
                status: 'Processing', 
                location: 'Central Hub', 
                timestamp: baseDate.toISOString(), 
                description: 'Order received and being processed.' 
            }
        ];

        // Simulate historical milestones if order is advanced
        if (order.status !== 'Processing' && order.status !== 'Cancelled') {
            const shipDate = new Date(baseDate.getTime() + 12 * 60 * 60 * 1000); // +12h
            milestones.push({
                status: 'Awaiting Shipment from Wholesaler',
                location: 'Wholesaler Warehouse',
                timestamp: shipDate.toISOString(),
                description: 'Wholesaler has confirmed stock and is preparing shipment.'
            });

            if (['Shipped to Hub', 'Shipped to You', 'Delivered'].includes(order.status)) {
                const hubDate = new Date(shipDate.getTime() + 24 * 60 * 60 * 1000); // +24h
                milestones.push({
                    status: 'Shipped to Hub',
                    location: 'Regional Distribution Center',
                    timestamp: hubDate.toISOString(),
                    description: 'Arrived at regional hub for final inspection.'
                });
            }

            if (['Shipped to You', 'Delivered'].includes(order.status)) {
                const transitDate = new Date(shipDate.getTime() + 36 * 60 * 60 * 1000); // +36h
                milestones.push({
                    status: 'Shipped to You',
                    location: 'On the road',
                    timestamp: transitDate.toISOString(),
                    description: 'Package is out for delivery to your address.'
                });
            }

            if (order.status === 'Delivered') {
                const deliveredDate = new Date(shipDate.getTime() + 40 * 60 * 60 * 1000); // +40h
                milestones.push({
                    status: 'Delivered',
                    location: order.shippingAddress,
                    timestamp: deliveredDate.toISOString(),
                    description: 'Package delivered and signed for.'
                });
            }
        }

        return milestones.reverse(); // Newest first
    }

    /**
     * Calculates an estimated delivery date.
     */
    calculateETA(orderDate: string): string {
        const date = new Date(orderDate);
        date.setDate(date.getDate() + 3); // Standard 3-day delivery
        return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    }
}
