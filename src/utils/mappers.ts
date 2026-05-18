import type { User, Product, Review, Order, Wholesaler } from '../types';

export const mapProductRecord = (product: any): Product => ({
   ...product,
   wholesalerStock: product.wholesaler_stock || [],
   priceHistory: product.price_history || [],
   reviewCount: product.review_count || 0,
   featureScore: product.feature_score || 0,
   avgRating: product.avg_rating || 0,
   imageUrl: product.image_url,
   dealTag: product.deal_tag,
   smartTag: product.smart_tag,
   oldPrice: product.old_price,
   specs: product.specs || {},
   reviews: []
});

export const mapUserRecord = (userRecord: any): User => ({
   ...userRecord,
   name: userRecord.name || userRecord.email || 'Admin',
   avatarUrl: userRecord.avatar_url || `https://i.pravatar.cc/150?u=${userRecord.id}`,
   role: userRecord.role || (userRecord.collectionName === '_superusers' ? 'admin' : 'user'),
   orderIds: userRecord.order_ids || [],
   cart: userRecord.cart || [],
   favorites: userRecord.favorites || [],
   reviews: [],
   retailerId: userRecord.retailer_id,
   retailerName: userRecord.retailer_name,
   phoneSecondary1: userRecord.phone_secondary_1,
   phoneSecondary2: userRecord.phone_secondary_2,
   emailSecondary1: userRecord.email_secondary_1,
   emailSecondary2: userRecord.email_secondary_2,
   addresses: userRecord.addresses || [],
   paymentMethods: userRecord.payment_methods || [],
});

export const mapReviewRecord = (review: any): Review => ({
   ...review,
   authorId: review.author_id,
   productId: review.product_id
});

export const mapOrderRecord = (order: any): Order => ({
   ...order,
   userId: order.user_id,
   trackingNumber: order.tracking_number,
   wholesalerTrackingNumber: order.wholesaler_tracking_number,
   paymentIntentId: order.payment_intent_id,
   paymentProvider: order.payment_provider,
   refundStatus: order.refund_status || 'Not Requested',
   refundId: order.refund_id,
   shippingAddress: order.shipping_address,
   items: order.items || [],
   totalCost: order.total_cost || 0,
   subshoppingStatus: order.subshopping_status,
   purchaseOrders: order.purchase_orders || [],
   fulfillmentTimeline: order.fulfillment_timeline || []
});

export const mapWholesalerRecord = (wholesaler: any): Wholesaler => ({
   ...wholesaler,
   logoUrl: wholesaler.logo_url,
   stockSync: wholesaler.stock_sync
});
