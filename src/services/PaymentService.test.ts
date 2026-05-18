import { describe, expect, it } from "vitest";
import { PaymentService } from "./PaymentService";

describe("PaymentService sandbox cards", () => {
  it("captures a successful Stripe Mexico sandbox card", async () => {
    const payment = await PaymentService.processRetailPayment(1299, "stripe_visa_success_mx");

    expect(payment.status).toBe("succeeded");
    expect(payment.provider).toBe("stripe");
    expect(payment.sandboxCardId).toBe("stripe_visa_success_mx");
  });

  it("rejects a decline sandbox card deterministically", async () => {
    await expect(
      PaymentService.processRetailPayment(1299, "stripe_insufficient_funds")
    ).rejects.toThrow("Payment was not successful.");
  });
});
