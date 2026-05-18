import { describe, expect, it, beforeEach } from "vitest";
import { wholesalersSignal } from "../signals/data.signals";
import type { Order } from "../types";
import { SubshoppingService } from "./SubshoppingService";

const makeOrder = (): Order => ({
  id: "order-test-1",
  userId: "user-test",
  date: "2026-05-18T10:00:00.000Z",
  total: 1200,
  totalCost: 900,
  status: "Processing",
  shippingAddress: "Av. Reforma 120, CDMX",
  items: [
    {
      productId: "prod-1",
      name: "Laptop test",
      imageUrl: "https://example.com/laptop.jpg",
      quantity: 1,
      price: 1200,
      cost: 900,
      wholesalerId: "wh-ingram",
    },
  ],
});

describe("SubshoppingService", () => {
  beforeEach(() => {
    wholesalersSignal.value = [
      {
        id: "wh-ingram",
        name: "Ingram Micro",
        contact: "ventas@example.com",
        rating: 4.8,
        stockSync: "Real-time",
        logoUrl: "",
        status: "Approved",
      },
    ];
  });

  it("groups checkout items into provider purchase orders", () => {
    const service = new SubshoppingService();
    const purchaseOrders = service.buildPurchaseOrders(makeOrder());

    expect(purchaseOrders).toHaveLength(1);
    expect(purchaseOrders[0]).toMatchObject({
      providerId: "ingram_mexico",
      runtime: "vhub",
      channel: "api",
      subtotalCost: 900,
      status: "Queued",
    });
  });

  it("creates a traceable wholesale workflow after retail payment", async () => {
    const service = new SubshoppingService();
    const order = makeOrder();
    const workflow = await service.startWorkflow(order);
    const merged = service.mergeWorkflow(order, workflow);

    expect(workflow.purchaseOrders[0].paymentStatus).toBe("Paid");
    expect(workflow.timeline.length).toBeGreaterThanOrEqual(3);
    expect(merged.status).toBe("Awaiting Shipment from Wholesaler");
    expect(merged.purchaseOrders?.[0].providerOrderId).toContain("B2B-INGRAM_MEXICO");
  });
});
