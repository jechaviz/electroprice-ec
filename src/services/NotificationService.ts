import { signal } from "@preact/signals-react";
import { toastSignal } from "../signals/ui.signals";
import type { Toast } from "../types";

export interface AppNotification {
    id: string;
    title: string;
    body: string;
    type: 'order' | 'promo' | 'system' | 'security' | 'success' | 'error';
    timestamp: string;
    read: boolean;
    link?: string;
}

export const notificationsSignal = signal<AppNotification[]>([]);
export const unreadCountSignal = signal<number>(0);

export class NotificationService {
    /**
     * Ephemeral toast only — transient feedback ("added to cart", validation
     * errors, sign-in feedback). NOT persisted to the notification bell, so the
     * bell never fills with throwaway messages. A toast is "you just did X"; a
     * notification is "something happened you may want to revisit later".
     */
    static toast(message: string, type: Toast['type'] = 'success') {
        toastSignal.value = { message, type };
    }

    /**
     * Persistent, bell-backed notification (order placed/updated, security,
     * system). Adds to the bell history, bumps the unread count, and also surfaces
     * a toast + browser push. Reserve this for events worth keeping.
     */
    static notify(title: string, body: string, type: AppNotification['type'] = 'system', link?: string) {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: AppNotification = {
            id,
            title,
            body,
            type,
            timestamp: new Date().toISOString(),
            read: false,
            link
        };

        // Add to history
        notificationsSignal.value = [newNotification, ...notificationsSignal.value];
        unreadCountSignal.value += 1;

        // Show UI Toast
        const toastType: Toast['type'] = (type === 'success' || type === 'error') ? type : 'success';
        toastSignal.value = { message: body, type: toastType };

        // Browser Push
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, { body });
            } catch (e) {
                console.warn("Push notification failed:", e);
            }
        }
    }

    // Quick toasts — ephemeral, do NOT touch the bell.
    static success(message: string) { this.toast(message, 'success'); }
    static error(message: string) { this.toast(message, 'error'); }

    static markAsRead(id: string) {
        notificationsSignal.value = notificationsSignal.value.map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        this.updateUnreadCount();
    }

    static markAllAsRead() {
        notificationsSignal.value = notificationsSignal.value.map(n => ({ ...n, read: true }));
        unreadCountSignal.value = 0;
    }

    private static updateUnreadCount() {
        unreadCountSignal.value = notificationsSignal.value.filter(n => !n.read).length;
    }

    static async requestPermission() {
        if ('Notification' in window) {
            await Notification.requestPermission();
        }
    }
}
