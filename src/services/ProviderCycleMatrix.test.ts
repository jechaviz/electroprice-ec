import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import transactionDryRunManifest from "../../config/providers/vimport/transaction_dryrun_manifest.json";
import { PROVIDER_INTEGRATIONS } from "../config/providerIntegrations";
import type { Order } from "../types";
import { OrderLifecycleService } from "./OrderLifecycleService";
import { PaymentService } from "./PaymentService";
import { ProviderRuntimeService } from "./ProviderRuntimeService";
import { SubshoppingService } from "./SubshoppingService";

const orderForProvider = (providerId: string, providerName: string): Order => ({
  id: `order-${providerId}`,
  userId: "user-provider-matrix",
  date: "2026-05-18T10:00:00.000Z",
  total: 1500,
  totalCost: 1000,
  status: "Processing",
  shippingAddress: "Av. Reforma 120, Cuauhtemoc, CDMX 06600",
  paymentIntentId: `pi_${providerId}`,
  paymentProvider: "stripe",
  refundStatus: "Not Requested",
  items: [
    {
      productId: `prod-${providerId}`,
      name: `Producto ${providerName}`,
      imageUrl: "https://example.com/product.jpg",
      quantity: 1,
      price: 1500,
      cost: 1000,
      wholesalerId: providerId,
    },
  ],
});

describe("provider cycle matrix", () => {
  it("classifies every provider as full-cycle capable or gated", () => {
    const runtime = new ProviderRuntimeService();
    const profiles = PROVIDER_INTEGRATIONS.map(provider => ({
      provider,
      profile: runtime.getProfile(provider.id, provider.name),
    }));

    expect(profiles).toHaveLength(24);
    expect(profiles.filter(item => item.profile.supportsPurchaseOrder)).toHaveLength(7);
    expect(profiles.filter(item => item.profile.status === "manual_gate")).toHaveLength(17);
  });

  it("runs the full customer cycle for every provider with order capability", async () => {
    const subshopping = new SubshoppingService();
    const lifecycle = new OrderLifecycleService();
    const providersWithOrders = PROVIDER_INTEGRATIONS.filter(provider =>
      provider.capabilities.includes("orders")
    );

    expect(providersWithOrders.map(provider => provider.id).sort()).toEqual([
      "commerceup_b2b",
      "ctonline",
      "cva",
      "dropi_mexico",
      "ingram_mexico",
      "intcomex_iws",
      "riqra_b2b",
    ]);

    for (const provider of providersWithOrders) {
      const payment = await PaymentService.processRetailPayment(1500, "stripe_visa_success_mx");
      const order = {
        ...orderForProvider(provider.id, provider.name),
        paymentIntentId: payment.id,
        paymentProvider: payment.provider,
      };

      const activeOrder = subshopping.mergeWorkflow(order, await subshopping.startWorkflow(order));
      expect(activeOrder.purchaseOrders?.[0]).toMatchObject({
        providerId: provider.id,
        paymentStatus: "Paid",
      });

      const delivered = lifecycle.confirmDelivery(lifecycle.advanceProviderShipment(activeOrder));
      expect(delivered.status).toBe("Delivered");
      expect(delivered.subshoppingStatus).toBe("Completed");

      const refunded = await lifecycle.completeRefund(
        lifecycle.requestReturn(delivered, `QA devolucion ${provider.name}`)
      );
      expect(refunded.status).toBe("Returned");
      expect(refunded.refundStatus).toBe("Refunded");
    }
  });

  it("keeps catalog-only providers behind a transaction gate", () => {
    const subshopping = new SubshoppingService();
    const gatedProviders = PROVIDER_INTEGRATIONS.filter(provider =>
      !provider.capabilities.includes("orders")
    );

    for (const provider of gatedProviders) {
      const purchaseOrder = subshopping.buildPurchaseOrders(orderForProvider(provider.id, provider.name))[0];
      expect(purchaseOrder.status).toBe("Provider Gate");
      expect(purchaseOrder.paymentStatus).toBe("Not Started");
      expect(purchaseOrder.nextAction).toContain("Registrar spec");
    }
  });

  it("indexes credentialed transaction dry-run specs without enabling submit", () => {
    const manifest = transactionDryRunManifest as {
      providers: Array<{ id: string; maturity: string; spec: string }>;
    };

    expect(manifest.providers.map(provider => provider.id).sort()).toEqual([
      "ctonline",
      "cva",
      "ingram_mexico",
      "syscom",
      "tecnosinergia",
    ]);

    for (const provider of manifest.providers) {
      const spec = readFileSync(path.resolve(process.cwd(), provider.spec), "utf8");
      expect(spec).toContain("mode: transaction_dryrun");
      expect(spec).toContain("submit_enabled: false");
      expect(spec).toMatch(/actions_denied:\s*\[[^\]]*(order_confirm|payment_submit)/);
      expect(spec).not.toMatch(/actions_allowed:\s*\[[^\]]*(order_confirm|payment_submit)/);
    }
  });
});
