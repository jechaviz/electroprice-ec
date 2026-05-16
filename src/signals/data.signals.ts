import { signal } from "@preact/signals-react";
import type { Product, User, Review, Order, Supplier, Wholesaler } from "../types";

export const productsSignal = signal<Product[]>([]);
export const usersSignal = signal<User[]>([]);
export const reviewsSignal = signal<Review[]>([]);
export const ordersSignal = signal<Order[]>([]);
export const suppliersSignal = signal<Supplier[]>([]);
export const wholesalersSignal = signal<Wholesaler[]>([]);

export const isCatalogLoadingSignal = signal<boolean>(false);
export const isAccountDataLoadingSignal = signal<boolean>(false);
export const dataErrorSignal = signal<string | null>(null);
