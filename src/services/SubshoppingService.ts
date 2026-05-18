import { wholesalersSignal } from "../signals/data.signals";
import type {
  Order,
  OrderItem,
  SubshoppingPurchaseOrder,
  SubshoppingStatus,
  SubshoppingTrackingEvent,
  SubshoppingWorkflow,
} from "../types";
import { PaymentService } from "./PaymentService";
import { ProviderRuntimeService } from "./ProviderRuntimeService";

const providerRuntime = new ProviderRuntimeService();

const createEventId = (orderId: string, suffix: string) =>
  `evt_${orderId}_${suffix}_${Math.random().toString(36).slice(2, 7)}`;

const groupItemsByProvider = (items: OrderItem[]) =>
  items.reduce<Record<string, OrderItem[]>>((groups, item) => {
    groups[item.wholesalerId] = [...(groups[item.wholesalerId] ?? []), item];
    return groups;
  }, {});

const sumCost = (items: OrderItem[]) =>
  items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

export class SubshoppingService {
  buildPurchaseOrders(order: Order): SubshoppingPurchaseOrder[] {
    const grouped = groupItemsByProvider(order.items);

    return Object.entries(grouped).map(([providerId, items], index) => {
      const wholesaler = wholesalersSignal.value.find(item => item.id === providerId);
      const profile = providerRuntime.getProfile(providerId, wholesaler?.name);
      const subtotalCost = sumCost(items);

      return {
        id: `po_${order.id}_${index + 1}`,
        providerId: profile.providerId,
        providerName: profile.providerName,
        channel: profile.channel,
        runtime: profile.runtime,
        status: profile.status === "manual_gate" ? "Provider Gate" : "Queued",
        paymentStatus: "Not Started",
        items,
        subtotalCost,
        shippingAddress: order.shippingAddress,
        nextAction: profile.nextAction,
      };
    });
  }

  async startWorkflow(order: Order): Promise<SubshoppingWorkflow> {
    const now = new Date().toISOString();
    const purchaseOrders = this.buildPurchaseOrders(order);
    const timeline: SubshoppingTrackingEvent[] = [
      {
        id: createEventId(order.id, "retail_paid"),
        at: now,
        actor: "retail",
        title: "Pago retail capturado",
        detail: "El cliente final completo el checkout; inicia compra con mayoristas.",
        status: "ok",
      },
    ];

    const processedOrders: SubshoppingPurchaseOrder[] = [];

    for (const purchaseOrder of purchaseOrders) {
      timeline.push({
        id: createEventId(order.id, `${purchaseOrder.id}_queued`),
        at: new Date().toISOString(),
        actor: purchaseOrder.runtime,
        providerId: purchaseOrder.providerId,
        title: `PO enviada a ${purchaseOrder.providerName}`,
        detail: `${purchaseOrder.items.length} linea(s), costo ${purchaseOrder.subtotalCost.toFixed(2)}.`,
        status: purchaseOrder.status === "Provider Gate" ? "warn" : "pending",
      });

      const payment = await PaymentService.payWholesalerPurchaseOrder({
        purchaseOrderId: purchaseOrder.id,
        providerId: purchaseOrder.providerId,
        amount: purchaseOrder.subtotalCost,
        runtime: purchaseOrder.runtime,
      });
      const submission = await providerRuntime.submitPurchaseOrder({
        purchaseOrderId: purchaseOrder.id,
        providerId: purchaseOrder.providerId,
        providerName: purchaseOrder.providerName,
        totalCost: purchaseOrder.subtotalCost,
      });

      const paid = payment.status === "paid";
      const requiresGate = payment.status === "manual_review" || !submission.ok;
      const nextStatus = requiresGate ? "Provider Gate" : paid ? "Paid" : "Submitted";

      processedOrders.push({
        ...purchaseOrder,
        status: nextStatus,
        paymentStatus: payment.status === "manual_review" ? "Manual Review" : paid ? "Paid" : "Authorized",
        paidAt: payment.paidAt,
        submittedAt: submission.ok ? new Date().toISOString() : undefined,
        providerOrderId: submission.providerOrderId,
        providerTrackingNumber: submission.providerTrackingNumber,
        runtimeTraceId: submission.traceId,
        nextAction: submission.nextAction ?? purchaseOrder.nextAction,
      });

      timeline.push({
        id: createEventId(order.id, `${purchaseOrder.id}_result`),
        at: new Date().toISOString(),
        actor: purchaseOrder.runtime,
        providerId: purchaseOrder.providerId,
        title: requiresGate ? "Compuerta proveedor requerida" : "Compra mayorista registrada",
        detail: requiresGate
          ? submission.nextAction ?? "El proveedor requiere accion autorizada antes de completar la compra."
          : `Orden ${submission.providerOrderId} pagada y lista para tracking.`,
        status: requiresGate ? "warn" : "ok",
      });
    }

    return {
      status: this.resolveWorkflowStatus(processedOrders),
      purchaseOrders: processedOrders,
      timeline,
      updatedAt: new Date().toISOString(),
    };
  }

  mergeWorkflow(order: Order, workflow: SubshoppingWorkflow): Order {
    return {
      ...order,
      status: workflow.status === "Completed" ? "Delivered" : "Awaiting Shipment from Wholesaler",
      subshoppingStatus: workflow.status,
      purchaseOrders: workflow.purchaseOrders,
      fulfillmentTimeline: workflow.timeline,
      wholesalerTrackingNumber: workflow.purchaseOrders.find(item => item.providerTrackingNumber)?.providerTrackingNumber,
    };
  }

  getOpsSummary(orders: Order[]) {
    const purchaseOrders = orders.flatMap(order => order.purchaseOrders ?? []);
    const openGates = purchaseOrders.filter(order => order.status === "Provider Gate").length;
    const paid = purchaseOrders.filter(order => order.paymentStatus === "Paid").length;
    const totalCost = purchaseOrders.reduce((sum, order) => sum + order.subtotalCost, 0);

    return {
      purchaseOrderCount: purchaseOrders.length,
      openGates,
      paid,
      totalCost,
      activeOrders: orders.filter(order => order.subshoppingStatus && order.subshoppingStatus !== "Completed").length,
    };
  }

  private resolveWorkflowStatus(purchaseOrders: SubshoppingPurchaseOrder[]): SubshoppingStatus {
    if (purchaseOrders.some(order => order.status === "Failed")) return "Exception";
    if (purchaseOrders.some(order => order.status === "Provider Gate")) return "Awaiting Provider";
    if (purchaseOrders.every(order => order.status === "Delivered")) return "Completed";
    if (purchaseOrders.some(order => ["Paid", "Shipped"].includes(order.status))) return "Tracking";
    return "Purchasing";
  }
}
