
export interface RetailerPrice {
  retailerId: string;
  name: string;
  logoUrl: string;
  price: number;
  stock: number;
  shippingCost: number;
  url: string;
}

export interface WholesalerStock {
  wholesalerId: string;
  price: number;
  stock: number;
  // Potentially add wholesaler-specific shipping info here in the future
}

export interface Review {
  id: string;
  author: string;
  authorId?: string; // Link review to a user
  rating: number; // out of 5
  comment: string;
  date: string;
  productId: string;
  status?: 'pending' | 'approved' | 'rejected'; // For moderation
}

export interface PriceHistory {
  date: string; // "YYYY-MM-DD"
  price: number;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  description: string;
  specs: Record<string, string>;
  avgRating: number;
  reviewCount: number;
  wholesalerStock: WholesalerStock[];
  oldPrice?: number;
  watching?: number;
  dealTag?: string;
  smartTag?: string;
  reviews: Review[];
  options?: ProductOption[];
  priceHistory: PriceHistory[];
  featureScore: number; // New: Quantitative score for specs
}

export interface Category {
  id: string;
  imageUrl: string;
}

export type Currency = 'USD' | 'MXN';
export type Rates = { [key in Currency]: number };
export type ViewMode = 'grid' | 'table' | 'map';

// New Types for Smart Filters
export type FilterType = 'slider' | 'checkbox';

export interface SliderFilterConfig {
  type: 'slider';
  key: string; // Corresponds to a key in product.specs
  labelKey: string; // For i18n
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface CheckboxFilterConfig {
  type: 'checkbox';
  key: string; // Corresponds to a key in Product (e.g., 'brand')
  labelKey: string; // For i18n
  options: string[];
}


export type SmartFilter = SliderFilterConfig | CheckboxFilterConfig;

export interface SmartFilterConfig {
  [category: string]: SmartFilter[];
}

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating-desc';

// E-commerce Types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number; // Price at the time of adding to cart
}

export type SubshoppingRuntime = 'vhub' | 'vimport' | 'manual';
export type SubshoppingChannel = 'api' | 'portal_fallback' | 'manual';
export type SubshoppingStatus =
  | 'Planning'
  | 'Purchasing'
  | 'Awaiting Provider'
  | 'Tracking'
  | 'Completed'
  | 'Exception';

export type PurchaseOrderStatus =
  | 'Draft'
  | 'Queued'
  | 'Provider Gate'
  | 'Submitted'
  | 'Provider Accepted'
  | 'Paid'
  | 'Backordered'
  | 'Shipped'
  | 'Delivered'
  | 'Failed'
  | 'Cancelled';

export type PurchaseOrderPaymentStatus =
  | 'Not Started'
  | 'Authorized'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'Manual Review';

export interface SubshoppingTrackingEvent {
  id: string;
  at: string;
  actor: 'retail' | 'vhub' | 'vimport' | 'manual' | 'provider' | 'logistics' | 'operator';
  title: string;
  detail: string;
  status: 'ok' | 'warn' | 'error' | 'pending';
  providerId?: string;
}

export interface SubshoppingPurchaseOrder {
  id: string;
  providerId: string;
  providerName: string;
  channel: SubshoppingChannel;
  runtime: SubshoppingRuntime;
  status: PurchaseOrderStatus;
  paymentStatus: PurchaseOrderPaymentStatus;
  items: OrderItem[];
  subtotalCost: number;
  shippingAddress: string;
  submittedAt?: string;
  paidAt?: string;
  providerOrderId?: string;
  providerTrackingNumber?: string;
  runtimeTraceId?: string;
  nextAction?: string;
}

export interface SubshoppingWorkflow {
  status: SubshoppingStatus;
  purchaseOrders: SubshoppingPurchaseOrder[];
  timeline: SubshoppingTrackingEvent[];
  updatedAt: string;
}

export type RetailPaymentProvider = 'stripe' | 'paypal';
export type RefundStatus = 'Not Requested' | 'Requested' | 'Approved' | 'Refunded' | 'Rejected';

export interface SandboxPaymentCard {
  id: string;
  provider: RetailPaymentProvider;
  label: string;
  displayNumber: string;
  scenario: 'success' | 'decline' | 'requires_action';
}

export type OrderStatus =
  | 'Processing'
  | 'Awaiting Shipment from Wholesaler'
  | 'Shipped to Hub'
  | 'Shipped to You'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned';

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number; // Retail price per item at time of purchase
  cost: number; // Cost from wholesaler per item at time of purchase
  wholesalerId: string; // Track which wholesaler fulfilled this item
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  items: OrderItem[];
  total: number; // Total paid by user
  totalCost: number; // Total cost from wholesalers
  status: OrderStatus;
  shippingAddress: string;
  trackingNumber?: string;
  wholesalerTrackingNumber?: string;
  paymentIntentId?: string;
  paymentProvider?: RetailPaymentProvider;
  refundStatus?: RefundStatus;
  refundId?: string;
  subshoppingStatus?: SubshoppingStatus;
  purchaseOrders?: SubshoppingPurchaseOrder[];
  fulfillmentTimeline?: SubshoppingTrackingEvent[];
}

export interface Supplier {
  id: string;
  name: string;
  type: 'API' | 'Scraping';
  status: 'Active' | 'Inactive';
  lastSync: string;
}

export interface Wholesaler {
  id: string;
  name: string;
  contact: string;
  rating: number;
  stockSync: 'Real-time' | 'Daily' | 'Manual';
  logoUrl: string;
  // FIX: Added status to support retailer dashboard functionality
  status: 'Pending' | 'Approved' | 'Disabled';
}

// New Types for Authentication
// FIX: Added 'retailer' to support retailer dashboard
export type UserRole = 'user' | 'admin' | 'retailer' | 'wholesaler';

export interface UserAddress {
  id: string;
  line1: string;
  line2: string;
  isPrimary: boolean;
}

export interface PaymentMethod {
  id: string;
  card: string;
  expires: string;
  isPrimary: boolean;
  type: 'visa' | 'mastercard' | 'amex' | 'paypal';
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl: string;
  role: UserRole;
  favorites: string[]; // Array of product IDs
  reviews: string[]; // Array of review IDs
  status?: 'active' | 'suspended' | 'banned';
  cart: CartItem[];
  orderIds: string[];
  // FIX: Add retailer-specific fields to support RetailerDashboard
  retailerId?: string;
  retailerName?: string;
  // Secondary contact info
  phoneSecondary1?: string;
  phoneSecondary2?: string;
  emailSecondary1?: string;
  emailSecondary2?: string;
  addresses: UserAddress[];
  paymentMethods: PaymentMethod[];
}

// Toast Notification Type
export interface Toast {
    message: string;
    type: 'success' | 'error';
}

export interface SignUpCredentials {
    name: string;
    password: string;
    email?: string;
    phone?: string;
}
