import { NotificationService } from "./NotificationService";
import type { RetailPaymentProvider, SandboxPaymentCard } from "../types";

export interface PaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    status: 'pending' | 'succeeded' | 'failed';
    provider: RetailPaymentProvider;
    sandboxCardId: string;
}

export interface WholesalePaymentResult {
    id: string;
    providerId: string;
    purchaseOrderId: string;
    amount: number;
    status: 'authorized' | 'paid' | 'failed' | 'manual_review';
    paidAt?: string;
}

export interface RefundResult {
    id: string;
    orderId: string;
    amount: number;
    status: 'refunded' | 'failed';
    refundedAt?: string;
}

export const SANDBOX_PAYMENT_CARDS: SandboxPaymentCard[] = [
    {
        id: 'stripe_visa_success_mx',
        provider: 'stripe',
        label: 'Stripe MX ok',
        displayNumber: '4000 0048 4000 8001',
        scenario: 'success',
    },
    {
        id: 'paypal_3ds_success_mx',
        provider: 'paypal',
        label: 'PayPal MX ok',
        displayNumber: '4779 1310 1069 6190',
        scenario: 'success',
    },
    {
        id: 'stripe_insufficient_funds',
        provider: 'stripe',
        label: 'Stripe rechazo',
        displayNumber: '4000 0000 0000 9995',
        scenario: 'decline',
    },
];

const normalizeCardNumber = (cardNumber: string) => cardNumber.replace(/\D/g, '');
const simulateDelay = (ms: number) => {
    if (import.meta.env.MODE === 'test') return Promise.resolve();
    return new Promise(resolve => setTimeout(resolve, ms));
};

export class PaymentService {
    static getSandboxCards(): SandboxPaymentCard[] {
        return SANDBOX_PAYMENT_CARDS;
    }

    static resolveSandboxCard(cardIdOrNumber?: string): SandboxPaymentCard {
        if (!cardIdOrNumber) return SANDBOX_PAYMENT_CARDS[0];
        const normalized = normalizeCardNumber(cardIdOrNumber);
        return SANDBOX_PAYMENT_CARDS.find(card =>
            card.id === cardIdOrNumber || normalizeCardNumber(card.displayNumber) === normalized
        ) ?? SANDBOX_PAYMENT_CARDS[0];
    }

    static async processRetailPayment(amount: number, sandboxCardId?: string): Promise<PaymentIntent> {
        const card = this.resolveSandboxCard(sandboxCardId);
        await simulateDelay(1500);

        if (card.scenario === 'decline') {
            NotificationService.error("Card declined");
            throw new Error("Payment was not successful.");
        }

        return {
            id: `pi_${Math.random().toString(36).substring(7)}`,
            clientSecret: `sec_${Math.random().toString(36).substring(7)}`,
            amount,
            status: 'succeeded',
            provider: card.provider,
            sandboxCardId: card.id,
        };
    }

    static async refundRetailPayment(input: {
        orderId: string;
        amount: number;
        paymentIntentId?: string;
    }): Promise<RefundResult> {
        await simulateDelay(350);
        return {
            id: `rf_${input.orderId}_${Math.random().toString(36).slice(2, 7)}`,
            orderId: input.orderId,
            amount: input.amount,
            status: 'refunded',
            refundedAt: new Date().toISOString(),
        };
    }

    static async payWholesalerPurchaseOrder(input: {
        purchaseOrderId: string;
        providerId: string;
        amount: number;
        runtime: 'vhub' | 'vimport' | 'manual';
    }): Promise<WholesalePaymentResult> {
        await simulateDelay(350);

        if (input.runtime === 'manual') {
            return {
                id: `wp_${input.purchaseOrderId}`,
                providerId: input.providerId,
                purchaseOrderId: input.purchaseOrderId,
                amount: input.amount,
                status: 'manual_review',
            };
        }

        return {
            id: `wp_${input.purchaseOrderId}`,
            providerId: input.providerId,
            purchaseOrderId: input.purchaseOrderId,
            amount: input.amount,
            status: 'paid',
            paidAt: new Date().toISOString(),
        };
    }
}
