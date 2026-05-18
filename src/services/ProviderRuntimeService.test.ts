import { describe, expect, it } from "vitest";
import { ProviderRuntimeService } from "./ProviderRuntimeService";

describe("ProviderRuntimeService", () => {
  it("maps local wholesaler aliases to vhub-ready provider specs", () => {
    const service = new ProviderRuntimeService();
    const profile = service.getProfile("wh-ingram", "Ingram Micro");

    expect(profile.providerId).toBe("ingram_mexico");
    expect(profile.runtime).toBe("vhub");
    expect(profile.channel).toBe("api");
    expect(profile.supportsPurchaseOrder).toBe(true);
  });

  it("keeps providers without order capability behind a manual gate", () => {
    const service = new ProviderRuntimeService();
    const profile = service.getProfile("syscom", "SYSCOM Mexico");

    expect(profile.supportsCatalog).toBe(true);
    expect(profile.supportsPurchaseOrder).toBe(false);
    expect(profile.status).toBe("manual_gate");
  });
});
