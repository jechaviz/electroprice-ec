import { signal } from "@preact/signals-react";
import type { Toast } from "../types";

export type View = 'home' | 'list' | 'detail' | 'profile' | 'adminDashboard' | 'settings' | 'cart' | 'checkout' | 'orderDetail';

export const viewSignal = signal<View>('home');
export const productIdSignal = signal<string | null>(null);
export const orderIdSignal = signal<string | null>(null);
export const searchTermSignal = signal<string>('');
export const categorySignal = signal<string | null>(null);
export const highlightedProductIdSignal = signal<string | null>(null);
export const quickViewProductIdSignal = signal<string | null>(null);

export const isLoginModalOpenSignal = signal<boolean>(false);
export const isCartDrawerOpenSignal = signal<boolean>(false);
export const isCheckoutLoadingSignal = signal<boolean>(false);

export const toastSignal = signal<Toast | null>(null);
