import { ordersSignal } from "../signals/data.signals";
import { loadPocketBase } from "../utils/pocketBaseClient";
import type { Order, SubshoppingTrackingEvent } from "../types";
import { PaymentService } from "./PaymentService";

const eventId = (orderId: string, action: string) =>
  `evt_${orderId}_${action}_${Math.random().toString(36).slice(2, 7)}`;

const appendEvent = (
  order: Order,
  event: Omit<SubshoppingTrackingEvent, "id" | "at">
): SubshoppingTrackingEvent[] => [
  ...(order.fulfillmentTimeline ?? []),
  {
    id: eventId(order.id, event.title.toLowerCase().replace(/\W+/g, "_")),
    at: new Date().toISOString(),
    ...event,
  },
];

const toRecordPayload = (order: Order) => ({
  status: order.status,
  subshopping_status: order.subshoppingStatus,
  purchase_orders: order.purchaseOrders ?? [],
  fulfillment_timeline: order.fulfillmentTimeline ?? [],
  tracking_number: order.trackingNumber,
  wholesaler_tracking_number: order.wholesalerTrackingNumber,
  refund_status: order.refundStatus,
  refund_id: order.refundId,
});

const hasOpenProviderGate = (order: Order) =>
  (order.purchaseOrders ?? []).some(po => po.status === "Provider Gate");

export class OrderLifecycleService {
  advanceProviderShipment(order: Order): Order {
    if (hasOpenProviderGate(order)) {
      return {
        ...order,
        status: "Awaiting Shipment from Wholesaler",
        subshoppingStatus: "Awaiting Provider",
        fulfillmentTimeline: appendEvent(order, {
          actor: "provider",
          title: "Compuerta proveedor pendiente",
          detail: "La entrega no puede avanzar hasta resolver las ordenes con compuerta de proveedor.",
          status: "warn",
        }),
      };
    }

    const trackingNumber = order.wholesalerTrackingNumber ?? `WH-${order.id.slice(-6).toUpperCase()}`;
    return {
      ...order,
      status: "Shipped to Hub",
      subshoppingStatus: "Tracking",
      wholesalerTrackingNumber: trackingNumber,
      purchaseOrders: (order.purchaseOrders ?? []).map(po => ({
        ...po,
        status: po.status === "Provider Gate" ? po.status : "Shipped",
        providerTrackingNumber: po.providerTrackingNumber ?? trackingNumber,
      })),
      fulfillmentTimeline: appendEvent(order, {
        actor: "provider",
        title: "Proveedor envio la orden",
        detail: `Tracking mayorista ${trackingNumber} registrado.`,
        status: "ok",
      }),
    };
  }

  confirmDelivery(order: Order): Order {
    if (hasOpenProviderGate(order)) {
      return {
        ...order,
        status: "Awaiting Shipment from Wholesaler",
        subshoppingStatus: "Awaiting Provider",
        fulfillmentTimeline: appendEvent(order, {
          actor: "logistics",
          title: "Entrega bloqueada por proveedor",
          detail: "No se puede confirmar entrega mientras una compra mayorista siga en Provider Gate.",
          status: "warn",
        }),
      };
    }

    const trackingNumber = order.trackingNumber ?? `EP-${order.id.slice(-6).toUpperCase()}`;
    return {
      ...order,
      status: "Delivered",
      subshoppingStatus: "Completed",
      trackingNumber,
      purchaseOrders: (order.purchaseOrders ?? []).map(po => ({ ...po, status: "Delivered" })),
      fulfillmentTimeline: appendEvent(order, {
        actor: "logistics",
        title: "Entrega confirmada",
        detail: `Cliente recibio el pedido con tracking ${trackingNumber}.`,
        status: "ok",
      }),
    };
  }

  requestReturn(order: Order, reason = "Cliente solicito devolucion"): Order {
    return {
      ...order,
      status: "Return Requested",
      refundStatus: "Requested",
      fulfillmentTimeline: appendEvent(order, {
        actor: "retail",
        title: "Devolucion solicitada",
        detail: reason,
        status: "warn",
      }),
    };
  }

  async completeRefund(order: Order, reason = "Reembolso aprobado"): Promise<Order> {
    const refund = await PaymentService.refundRetailPayment({
      orderId: order.id,
      amount: order.total,
      paymentIntentId: order.paymentIntentId,
    });

    return {
      ...order,
      status: "Returned",
      refundStatus: refund.status === "refunded" ? "Refunded" : "Rejected",
      refundId: refund.id,
      purchaseOrders: (order.purchaseOrders ?? []).map(po => ({ ...po, paymentStatus: "Refunded" })),
      fulfillmentTimeline: appendEvent(order, {
        actor: "retail",
        title: "Reembolso completado",
        detail: `${reason}. Refund ${refund.id}.`,
        status: refund.status === "refunded" ? "ok" : "error",
      }),
    };
  }

  async persist(order: Order): Promise<Order> {
    try {
      const pb = await loadPocketBase();
      await pb.collection("orders").update(order.id, toRecordPayload(order));
    } catch {
      // Offline demo mode keeps the signal update below.
    }

    ordersSignal.value = ordersSignal.value.map(item => item.id === order.id ? order : item);
    return order;
  }

  async confirmDeliveryById(orderId: string): Promise<boolean> {
    const order = ordersSignal.value.find(item => item.id === orderId);
    if (!order) return false;
    if (hasOpenProviderGate(order)) {
      await this.persist(this.advanceProviderShipment(order));
      return false;
    }

    const shippedOrder = order.status === "Shipped to Hub" || order.status === "Shipped to You"
      ? order
      : this.advanceProviderShipment(order);
    await this.persist(this.confirmDelivery(shippedOrder));
    return true;
  }

  async requestReturnById(orderId: string): Promise<boolean> {
    const order = ordersSignal.value.find(item => item.id === orderId);
    if (!order) return false;
    await this.persist(this.requestReturn(order));
    return true;
  }

  async refundReturnById(orderId: string): Promise<boolean> {
    const order = ordersSignal.value.find(item => item.id === orderId);
    if (!order) return false;
    await this.persist(await this.completeRefund(order));
    return true;
  }
}
