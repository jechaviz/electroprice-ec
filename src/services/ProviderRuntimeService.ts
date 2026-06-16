import {
  findProviderIntegration,
  providerRuntimeEndpoints,
  PROVIDER_INTEGRATIONS,
  type ProviderIntegration,
} from "../config/providerIntegrations";
import type { SubshoppingChannel, SubshoppingRuntime } from "../types";

export interface ProviderRuntimeProfile {
  providerId: string;
  providerName: string;
  runtime: SubshoppingRuntime;
  channel: SubshoppingChannel;
  status: "ready" | "degraded" | "manual_gate";
  supportsCatalog: boolean;
  supportsLiveQuote: boolean;
  supportsPurchaseOrder: boolean;
  supportsTracking: boolean;
  nextAction: string;
}

interface RuntimeSubmission {
  ok: boolean;
  providerOrderId?: string;
  providerTrackingNumber?: string;
  traceId: string;
  nextAction?: string;
}

const PROVIDER_ALIASES: Record<string, string> = {
  "wh-cva": "cva",
  "cva demo": "cva",
  "cva": "cva",
  "wh-ingram": "ingram_mexico",
  "ingram demo": "ingram_mexico",
  "ingram micro": "ingram_mexico",
  "wh-ctoneline": "ctonline",
  "ctonline": "ctonline",
  "ctonline ct connect": "ctonline",
  "wh-syscom": "syscom",
  "syscom mexico": "syscom",
  "syscom": "syscom",
};

// Production routes purchase orders to the same-origin no-submit runtime by
// default; an explicit VITE_SUBSHOPPING_LIVE_RUNTIME flag still wins.
const liveRuntimeEnabled = () => {
  const flag = import.meta.env.VITE_SUBSHOPPING_LIVE_RUNTIME;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return import.meta.env.PROD === true;
};
const sandboxRuntimeEnabled = () => (
  import.meta.env.MODE === "test"
  || import.meta.env.DEV
  || import.meta.env.VITE_ENABLE_SUBSHOPPING_SANDBOX === "true"
);

const normalize = (value: string) => value.toLowerCase().trim().replace(/\s+/g, " ");

const createTraceId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const getProviderByAlias = (providerId: string, providerName?: string): ProviderIntegration | undefined => {
  const direct = findProviderIntegration(providerId);
  if (direct) return direct;

  const providerKey = PROVIDER_ALIASES[normalize(providerId)];
  if (providerKey) return findProviderIntegration(providerKey);

  if (!providerName) return undefined;
  const nameKey = PROVIDER_ALIASES[normalize(providerName)];
  if (nameKey) return findProviderIntegration(nameKey);

  return PROVIDER_INTEGRATIONS.find((provider) =>
    normalize(provider.name).includes(normalize(providerName))
  );
};

export class ProviderRuntimeService {
  getProfile(providerId: string, providerName?: string): ProviderRuntimeProfile {
    const integration = getProviderByAlias(providerId, providerName);
    const displayName = integration?.name ?? providerName ?? providerId;
    const hasApi = integration?.channels.includes("api") ?? false;
    const hasPortal = integration?.channels.includes("portal_fallback") ?? false;
    const hasOrders = integration?.capabilities.includes("orders") ?? false;
    const hasWaybills = integration?.capabilities.some((item) =>
      ["waybills", "shipping_guides", "tracking", "returns"].includes(item)
    ) ?? false;

    if (hasApi && hasOrders) {
      return {
        providerId: integration?.id ?? providerId,
        providerName: displayName,
        runtime: "vhub",
        channel: "api",
        status: "ready",
        supportsCatalog: true,
        supportsLiveQuote: true,
        supportsPurchaseOrder: true,
        supportsTracking: hasWaybills,
        nextAction: "Orden directa por vhub con spec api_integrator.",
      };
    }

    if (hasPortal && hasOrders) {
      return {
        providerId: integration?.id ?? providerId,
        providerName: displayName,
        runtime: "vimport",
        channel: "portal_fallback",
        status: "degraded",
        supportsCatalog: true,
        supportsLiveQuote: integration?.capabilities.includes("price") ?? false,
        supportsPurchaseOrder: true,
        supportsTracking: hasWaybills,
        nextAction: "Automatizar portal con vimport cuando el usuario autorice la sesion.",
      };
    }

    return {
      providerId: integration?.id ?? providerId,
      providerName: displayName,
      runtime: "manual",
      channel: "manual",
      status: "manual_gate",
      supportsCatalog: integration?.capabilities.includes("catalog") ?? false,
      supportsLiveQuote: integration?.capabilities.includes("price") ?? false,
      supportsPurchaseOrder: false,
      supportsTracking: false,
      nextAction: "Registrar spec de compra o completar onboarding del proveedor.",
    };
  }

  listProfiles() {
    return PROVIDER_INTEGRATIONS.map((provider) => this.getProfile(provider.id, provider.name));
  }

  async submitPurchaseOrder(input: {
    purchaseOrderId: string;
    providerId: string;
    providerName: string;
    totalCost: number;
  }): Promise<RuntimeSubmission> {
    const profile = this.getProfile(input.providerId, input.providerName);
    if (profile.status === "manual_gate") {
      return {
        ok: false,
        traceId: createTraceId("manual"),
        nextAction: profile.nextAction,
      };
    }

    if (liveRuntimeEnabled()) {
      const runtimeResult = await this.callRuntime(profile.runtime, "/subshopping/purchase-orders", input);
      if (runtimeResult) return runtimeResult;
      return {
        ok: false,
        traceId: createTraceId(profile.runtime),
        nextAction: `${profile.runtime} did not acknowledge the purchase order. Review runtime health before submitting.`,
      };
    }

    if (!sandboxRuntimeEnabled()) {
      return {
        ok: false,
        traceId: createTraceId(profile.runtime),
        nextAction: "Subshopping sandbox is disabled; enable a live runtime before submitting provider orders.",
      };
    }

    return {
      ok: true,
      providerOrderId: `B2B-${profile.providerId.toUpperCase()}-${input.purchaseOrderId.slice(-6)}`,
      providerTrackingNumber: profile.supportsTracking ? `TRK-${profile.providerId.toUpperCase()}-${Date.now().toString(36)}` : undefined,
      traceId: createTraceId(profile.runtime),
      nextAction: profile.supportsTracking ? "Esperar tracking proveedor." : "Confirmar guia en portal proveedor.",
    };
  }

  private async callRuntime(
    runtime: SubshoppingRuntime,
    path: string,
    payload: Record<string, unknown>
  ): Promise<RuntimeSubmission | null> {
    if (runtime === "manual") return null;
    const baseUrl = runtime === "vhub" ? providerRuntimeEndpoints.vhubBaseUrl : providerRuntimeEndpoints.vimportBaseUrl;
    const controller = new AbortController();
    globalThis.setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
}
