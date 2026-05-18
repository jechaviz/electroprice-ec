import { 
    currentUserSignal 
} from "../signals/auth.signals";
import { 
    productsSignal, ordersSignal 
} from "../signals/data.signals";
import { 
    isCartDrawerOpenSignal, isCheckoutLoadingSignal, orderIdSignal, viewSignal 
} from "../signals/ui.signals";
import { loadPocketBase } from "../utils/pocketBaseClient";
import { calculateRetailPrice, calculateOrderAmounts } from "../utils/pricing";
import { preloadCartDrawer } from "../utils/deferredOverlays";
import { NotificationService } from "./NotificationService";
import { PaymentService } from "./PaymentService";
import { services } from "./ServiceContainer";
import type { CartItem, Order, OrderItem, OrderStatus } from "../types";

export class CartService {
    static async addToCart(productId: string, quantity: number) {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'user') {
            NotificationService.error('Please sign in as a customer to shop.');
            return;
        }

        const requestedQuantity = Math.max(1, Math.floor(quantity));
        const products = productsSignal.value;
        const product = products.find(p => p.id === productId);

        if (!product) {
            NotificationService.error('Product not found.');
            return;
        }

        const availableStock = product.wholesalerStock.filter(ws => ws.stock > 0);
        const totalAvailableStock = availableStock.reduce((sum, ws) => sum + ws.stock, 0);

        if (availableStock.length === 0) {
            NotificationService.error('This product is out of stock.');
            return;
        }

        const bestPrice = Math.min(...availableStock.map(p => p.price));
        const existingItem = user.cart.find(item => item.productId === productId);
        const nextQuantity = (existingItem?.quantity || 0) + requestedQuantity;

        if (nextQuantity > totalAvailableStock) {
            NotificationService.error(`Only ${totalAvailableStock} units are available.`);
            return;
        }

        let newCart: CartItem[];
        if (existingItem) {
            newCart = user.cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + requestedQuantity } : item);
        } else {
            const retailPrice = calculateRetailPrice(bestPrice);
            newCart = [...user.cart, { productId, quantity: requestedQuantity, price: retailPrice }];
        }

        // Optimistic update
        currentUserSignal.value = { ...user, cart: newCart };
        services.analytics.trackEvent('add_to_cart', { productId, quantity: requestedQuantity, price: bestPrice });

        try {
            if (!user.id.startsWith('mock_')) {
                const pb = await loadPocketBase();
                await pb.collection('users').update(user.id, { cart: newCart });
            }
            preloadCartDrawer();
            NotificationService.success(`${product.name} agregado al carrito.`);
            isCartDrawerOpenSignal.value = true;
        } catch (e) {
            NotificationService.error('Fallo de red al actualizar carrito.');
            // Revert on failure? (Simplified for now)
        }
    }

    static async updateCartQuantity(productId: string, quantity: number) {
        const user = currentUserSignal.value;
        if (!user) return;

        const requestedQuantity = Math.floor(quantity);
        if (requestedQuantity < 1) return;

        const product = productsSignal.value.find(p => p.id === productId);
        const totalAvailableStock = product?.wholesalerStock.reduce((sum, ws) => sum + ws.stock, 0) ?? requestedQuantity;

        if (requestedQuantity > totalAvailableStock) {
            NotificationService.error(`Only ${totalAvailableStock} units are available.`);
            return;
        }

        const previousCart = user.cart;
        const newCart = user.cart.map(item => item.productId === productId ? { ...item, quantity: requestedQuantity } : item);
        
        currentUserSignal.value = { ...user, cart: newCart };

        if (!user.id.startsWith('mock_')) {
            try {
                const pb = await loadPocketBase();
                await pb.collection('users').update(user.id, { cart: newCart });
            } catch (e) {
                console.error(e);
                currentUserSignal.value = { ...user, cart: previousCart };
                NotificationService.error('Fallo de red al actualizar carrito.');
            }
        }
    }

    static async removeFromCart(productId: string) {
        const user = currentUserSignal.value;
        if (!user) return;

        const previousCart = user.cart;
        const newCart = user.cart.filter(item => item.productId !== productId);
        
        currentUserSignal.value = { ...user, cart: newCart };

        if (!user.id.startsWith('mock_')) {
            try {
                const pb = await loadPocketBase();
                await pb.collection('users').update(user.id, { cart: newCart });
            } catch (e) {
                console.error(e);
                currentUserSignal.value = { ...user, cart: previousCart };
                NotificationService.error('Fallo de red al actualizar carrito.');
            }
        }
    }

    static async placeOrder(shippingAddress: string, sandboxCardId?: string) {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'user' || user.cart.length === 0) {
            NotificationService.error('Cannot place order.');
            return;
        }

        isCheckoutLoadingSignal.value = true;
        services.analytics.trackEvent('checkout_start', { itemCount: user.cart.length });

        try {
            const pb = await loadPocketBase();
            const newOrderItems: OrderItem[] = [];
            const products = productsSignal.value;
            const productsWithUpdatedStock = products.map(p => ({ ...p, wholesalerStock: [...p.wholesalerStock] }));

            for (const cartItem of user.cart) {
                const product = productsWithUpdatedStock.find(p => p.id === cartItem.productId);
                if (!product) throw new Error(`Producto con ID ${cartItem.productId} no encontrado.`);

                const bestWholesaler = product.wholesalerStock
                    .filter(ws => ws.stock >= cartItem.quantity)
                    .sort((a, b) => a.price - b.price)[0];

                if (!bestWholesaler) throw new Error(`Stock insuficiente para ${product.name}.`);

                newOrderItems.push({
                    productId: cartItem.productId,
                    name: product.name,
                    imageUrl: product.imageUrl,
                    quantity: cartItem.quantity,
                    price: cartItem.price,
                    cost: bestWholesaler.price,
                    wholesalerId: bestWholesaler.wholesalerId,
                });

                const wsIndex = product.wholesalerStock.findIndex(ws => ws.wholesalerId === bestWholesaler.wholesalerId);
                product.wholesalerStock[wsIndex].stock -= cartItem.quantity;
            }

            const subtotal = newOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalCost = newOrderItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
            const total = calculateOrderAmounts(subtotal).total;
            const orderDate = new Date().toISOString();

            // STEP 1: Capture retail payment with a sandbox provider profile.
            const intent = await PaymentService.processRetailPayment(total, sandboxCardId);

            // STEP 3: Create Order Record (After payment success)
            const createdOrder = await pb.collection('orders').create({
                user_id: user.id,
                date: orderDate,
                items: newOrderItems,
                total,
                total_cost: totalCost,
                status: 'Processing',
                payment_intent_id: intent.id,
                payment_provider: intent.provider,
                refund_status: 'Not Requested',
                shipping_address: shippingAddress
            });
            const newOrderId = createdOrder.id;

            const stockUpdatePromises = newOrderItems.map(item => {
                const productToUpdate = productsWithUpdatedStock.find(p => p.id === item.productId);
                if (!productToUpdate) return Promise.resolve();
                return pb.collection('products').update(item.productId, { wholesaler_stock: productToUpdate.wholesalerStock });
            });
            await Promise.all(stockUpdatePromises);
            
            await pb.collection('users').update(user.id, {
                cart: [],
                order_ids: [...user.orderIds, newOrderId]
            });

            const newOrder: Order = {
                id: newOrderId,
                userId: user.id,
                date: (createdOrder as any).date || orderDate,
                items: newOrderItems,
                total,
                totalCost,
                status: 'Processing',
                shippingAddress,
                paymentIntentId: intent.id,
                paymentProvider: intent.provider,
                refundStatus: 'Not Requested',
            };

            const workflow = await services.subshopping.startWorkflow(newOrder);
            const activeOrder = services.subshopping.mergeWorkflow(newOrder, workflow);

            try {
                await pb.collection('orders').update(newOrderId, {
                    status: activeOrder.status,
                    subshopping_status: activeOrder.subshoppingStatus,
                    purchase_orders: activeOrder.purchaseOrders,
                    fulfillment_timeline: activeOrder.fulfillmentTimeline,
                    wholesaler_tracking_number: activeOrder.wholesalerTrackingNumber,
                });
            } catch (workflowPersistError) {
                console.warn('Subshopping workflow could not be persisted. Run pb:setup to add workflow fields.', workflowPersistError);
            }

            // Update signals
            productsSignal.value = productsWithUpdatedStock;
            ordersSignal.value = [...ordersSignal.value, activeOrder];
            currentUserSignal.value = { ...user, cart: [], orderIds: [...user.orderIds, newOrderId] };

            NotificationService.success('¡Pedido realizado con éxito!');
            services.analytics.trackPurchase(newOrderId, total, newOrderItems.length);
            orderIdSignal.value = newOrderId;
            viewSignal.value = 'orderDetail';

        } catch (error: any) {
            console.error("Failed to place order:", error);
            NotificationService.error(error.message || 'Ocurrió un error inesperado al procesar tu pedido.');
        } finally {
            isCheckoutLoadingSignal.value = false;
        }
    }

    static async updateOrderStatus(orderId: string, status: OrderStatus) {
        const user = currentUserSignal.value;
        if (user?.role !== 'admin' && status !== 'Awaiting Shipment from Wholesaler' && status !== 'Cancelled' && status !== 'Return Requested') {
            return false;
        }

        try {
            const pb = await loadPocketBase();
            await pb.collection('orders').update(orderId, { status });
            ordersSignal.value = ordersSignal.value.map(o => o.id === orderId ? { ...o, status } : o);
            if (user?.role === 'admin') {
                NotificationService.success(`Order ${orderId} status updated to ${status}.`);
            }
            return true;
        } catch (e) {
            console.error(e);
            NotificationService.error('Failed to update order status.');
            return false;
        }
    }
}
