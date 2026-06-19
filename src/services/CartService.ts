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
import { ProductCatalogService } from "./ProductCatalogService";
import { createCartLineId, getCartItemKey, normalizeSelectedOptions } from "../utils/cartLine";
import type { CartItem, Order, OrderItem, OrderStatus, Product, WholesalerStock } from "../types";

interface CheckoutCommitProduct {
    id: string;
    wholesalerStock: WholesalerStock[];
    bestPrice?: number | null;
    totalStock?: number;
    isDeal?: boolean;
    indexedAt?: string;
}

interface CheckoutCommitResponse {
    orderId: string;
    products?: CheckoutCommitProduct[];
    orderIds?: string[];
}

const applyCommittedProductStock = (
    products: Product[],
    committedProducts: CheckoutCommitProduct[] = []
): Product[] => {
    if (committedProducts.length === 0) return products;

    const updates = new Map(committedProducts.map(product => [product.id, product]));
    return products.map(product => {
        const update = updates.get(product.id);
        if (!update) return product;

        return {
            ...product,
            wholesalerStock: update.wholesalerStock,
            bestPrice: update.bestPrice ?? product.bestPrice,
            totalStock: update.totalStock ?? product.totalStock,
            isDeal: update.isDeal ?? product.isDeal,
            indexedAt: update.indexedAt ?? product.indexedAt,
        };
    });
};

export class CartService {
    static async addToCart(productId: string, quantity: number, selectedOptions: Record<string, string> = {}) {
        const user = currentUserSignal.value;
        if (!user || user.role !== 'user') {
            NotificationService.error('Please sign in as a customer to shop.');
            return;
        }

        const requestedQuantity = Math.floor(quantity);
        if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1) {
            NotificationService.error('Quantity must be at least 1.');
            return;
        }
        const products = productsSignal.value;
        const product = products.find(p => p.id === productId) ?? await ProductCatalogService.fetchProductDetail(productId);

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

        const normalizedOptions = normalizeSelectedOptions(selectedOptions);
        const cartLineId = createCartLineId(productId, normalizedOptions);
        const bestPrice = Math.min(...availableStock.map(p => p.price));
        const existingItem = user.cart.find(item => getCartItemKey(item) === cartLineId);
        const quantityAlreadyInCart = user.cart
            .filter(item => item.productId === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
        const nextQuantityForProduct = quantityAlreadyInCart + requestedQuantity;

        if (nextQuantityForProduct > totalAvailableStock) {
            NotificationService.error(`Only ${totalAvailableStock} units are available.`);
            return;
        }

        let newCart: CartItem[];
        if (existingItem) {
            newCart = user.cart.map(item => getCartItemKey(item) === cartLineId
                ? { ...item, id: cartLineId, quantity: item.quantity + requestedQuantity, selectedOptions: normalizedOptions }
                : item
            );
        } else {
            const retailPrice = calculateRetailPrice(bestPrice);
            newCart = [...user.cart, { id: cartLineId, productId, quantity: requestedQuantity, price: retailPrice, selectedOptions: normalizedOptions }];
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

    static async updateCartQuantity(cartItemId: string, quantity: number) {
        const user = currentUserSignal.value;
        if (!user) return;

        const requestedQuantity = Math.floor(quantity);
        if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1) return;

        const targetItem = user.cart.find(item => getCartItemKey(item) === cartItemId);
        if (!targetItem) return;

        let product = productsSignal.value.find(p => p.id === targetItem.productId) ?? null;
        if (!product) {
            try {
                product = await ProductCatalogService.fetchProductDetail(targetItem.productId);
            } catch (error) {
                console.error(error);
            }
        }

        if (!product && requestedQuantity > targetItem.quantity) {
            NotificationService.error('Could not verify product stock.');
            return;
        }

        const totalAvailableStock = product?.wholesalerStock.reduce((sum, ws) => sum + ws.stock, 0) ?? requestedQuantity;
        const quantityAlreadyInOtherLines = user.cart
            .filter(item => item.productId === targetItem.productId && getCartItemKey(item) !== cartItemId)
            .reduce((sum, item) => sum + item.quantity, 0);

        if (quantityAlreadyInOtherLines + requestedQuantity > totalAvailableStock) {
            NotificationService.error(`Only ${totalAvailableStock} units are available.`);
            return;
        }

        const previousCart = user.cart;
        const newCart = user.cart.map(item => getCartItemKey(item) === cartItemId
            ? { ...item, id: getCartItemKey(item), quantity: requestedQuantity }
            : item
        );
        
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

    static async removeFromCart(cartItemId: string) {
        const user = currentUserSignal.value;
        if (!user) return;

        const previousCart = user.cart;
        const newCart = user.cart.filter(item => getCartItemKey(item) !== cartItemId);
        
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
            const missingProductIds = [
                ...new Set(
                    user.cart
                        .map(item => item.productId)
                        .filter(productId => !products.some(product => product.id === productId))
                )
            ];

            if (missingProductIds.length > 0) {
                await Promise.all(missingProductIds.map(productId => ProductCatalogService.fetchProductDetail(productId)));
            }

            const hydratedProducts = productsSignal.value;
            const productsWithUpdatedStock = hydratedProducts.map(p => ({ ...p, wholesalerStock: [...p.wholesalerStock] }));

            for (const cartItem of user.cart) {
                const product = productsWithUpdatedStock.find(p => p.id === cartItem.productId);
                if (!product) throw new Error(`Producto con ID ${cartItem.productId} no encontrado.`);

                const bestWholesaler = product.wholesalerStock
                    .filter(ws => ws.stock >= cartItem.quantity)
                    .sort((a, b) => a.price - b.price)[0];

                if (!bestWholesaler) throw new Error(`Stock insuficiente para ${product.name}.`);

                newOrderItems.push({
                    cartLineId: getCartItemKey(cartItem),
                    productId: cartItem.productId,
                    name: product.name,
                    imageUrl: product.imageUrl,
                    quantity: cartItem.quantity,
                    price: cartItem.price,
                    cost: bestWholesaler.price,
                    wholesalerId: bestWholesaler.wholesalerId,
                    selectedOptions: cartItem.selectedOptions,
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

            const commit = await pb.send(`/api/electroprice/checkout/orders/${encodeURIComponent(newOrderId)}/commit`, {
                method: 'POST',
                requestKey: null,
            });
            const checkoutCommit = commit as CheckoutCommitResponse;
            const committedProducts = applyCommittedProductStock(productsWithUpdatedStock, checkoutCommit.products);
            const committedOrderIds = checkoutCommit.orderIds ?? [...user.orderIds, newOrderId];

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
            productsSignal.value = committedProducts;
            ordersSignal.value = [...ordersSignal.value, activeOrder];
            currentUserSignal.value = { ...user, cart: [], orderIds: committedOrderIds };

            // Persistent bell notification — an order is worth keeping/revisiting.
            NotificationService.notify('Pedido', '¡Pedido realizado con éxito!', 'order', `/order/${newOrderId}`);
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
                NotificationService.notify('Pedido', `Pedido ${orderId} → ${status}`, 'order', `/order/${orderId}`);
            }
            return true;
        } catch (e) {
            console.error(e);
            NotificationService.error('Failed to update order status.');
            return false;
        }
    }
}
