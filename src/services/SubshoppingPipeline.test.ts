import { describe, expect, it, beforeEach } from "vitest";
import { wholesalersSignal } from "../signals/data.signals";
import type { Order } from "../types";
import { OrderLifecycleService } from "./OrderLifecycleService";
import { PaymentService } from "./PaymentService";
import { SubshoppingService } from "./SubshoppingService";

const baseOrder = (): Order => ({
  id: "order-pipeline-1",
  userId: "user-pipeline",
  date: "2026-05-18T10:00:00.000Z",
  total: 1850,
  totalCost: 1425,
  status: "Processing",
  shippingAddress: "Av. Reforma 120, Cuauhtemoc, CDMX 06600",
  paymentIntentId: "pi_pipeline",
  paymentProvider: "stripe",
  refundStatus: "Not Requested",
  items: [
    {
      productId: "prod-laptop",
      name: "Laptop demo",
      imageUrl: "https://example.com/laptop.jpg",
      quantity: 1,
      price: 1500,
      cost: 1200,
      wholesalerId: "wh-ingram",
    },
    {
      productId: "prod-headphones",
      name: "Audifonos demo",
      imageUrl: "https://example.com/headphones.jpg",
      quantity: 1,
      price: 350,
      cost: 225,
      wholesalerId: "wh-cva",
    },
  ],
});

describe("full subshopping customer pipeline", () => {
  beforeEach(() => {
    wholesalersSignal.value = [
      {
        id: "wh-ingram",
        name: "Ingram Micro",
        contact: "ventas@ingram.example",
        rating: 4.8,
        stockSync: "Real-time",
        logoUrl: "",
        status: "Approved",
      },
      {
        id: "wh-cva",
        name: "CVA",
        contact: "ventas@cva.example",
        rating: 4.6,
        stockSync: "Daily",
        logoUrl: "",
        status: "Approved",
      },
    ];
  });

  it("captures payment, creates provider POs, delivers, returns, and refunds", async () => {
    const retailPayment = await PaymentService.processRetailPayment(1850, "stripe_visa_success_mx");
    const order: Order = { ...baseOrder(), paymentIntentId: retailPayment.id, paymentProvider: retailPayment.provider };

    const subshopping = new SubshoppingService();
    const lifecycle = new OrderLifecycleService();
    const workflow = await subshopping.startWorkflow(order);
    const activeOrder = subshopping.mergeWorkflow(order, workflow);

    expect(activeOrder.status).toBe("Awaiting Shipment from Wholesaler");
    expect(activeOrder.purchaseOrders).toHaveLength(2);
    expect(activeOrder.purchaseOrders?.every(po => po.paymentStatus === "Paid")).toBe(true);

    const shipped = lifecycle.advanceProviderShipment(activeOrder);
    expect(shipped.status).toBe("Shipped to Hub");
    expect(shipped.purchaseOrders?.every(po => po.status === "Shipped")).toBe(true);

    const delivered = lifecycle.confirmDelivery(shipped);
    expect(delivered.status).toBe("Delivered");
    expect(delivered.subshoppingStatus).toBe("Completed");

    const returnRequested = lifecycle.requestReturn(delivered, "Producto no cumple expectativa");
    expect(returnRequested.status).toBe("Return Requested");
    expect(returnRequested.refundStatus).toBe("Requested");

    const refunded = await lifecycle.completeRefund(returnRequested);
    expect(refunded.status).toBe("Returned");
    expect(refunded.refundStatus).toBe("Refunded");
    expect(refunded.refundId).toContain("rf_order-pipeline-1");
  });
});
