import { signal, computed } from "@preact/signals-react";
import type { User } from "../types";

export const currentUserSignal = signal<User | null>(null);
export const isAuthLoadingSignal = signal<boolean>(true);

export const isAuthenticatedSignal = computed(() => !!currentUserSignal.value);
export const userRoleSignal = computed(() => currentUserSignal.value?.role || null);
export const cartItemCountSignal = computed(() => 
    currentUserSignal.value?.cart.reduce((sum, item) => sum + item.quantity, 0) || 0
);
