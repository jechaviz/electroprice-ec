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
     * Centralized notification method. Shows a toast AND adds to history.
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
        toastSignal.value = { message: `${title}: ${body}`, type: toastType };

        // Browser Push
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, { body });
            } catch (e) {
                console.warn("Push notification failed:", e);
            }
        }
    }

    // Helper methods for quick toasts
    static success(message: string) { this.notify('Success', message, 'success'); }
    static error(message: string) { this.notify('Error', message, 'error'); }

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
