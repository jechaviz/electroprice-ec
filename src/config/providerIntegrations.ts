import catalog from "../../config/providers/catalog.json";

export type ProviderChannel = "api" | "soap_legacy" | "portal_fallback" | "scheduler";
export type ProviderKind =
  | "b2b_platform"
  | "commerce_platform"
  | "dropship_platform"
  | "inventory_platform"
  | "scheduler"
  | "wholesaler";

export type ProviderStatus =
  | "active_runtime_config"
  | "api_spec_ready"
  | "portal_validated_api_credentials_required"
  | "portal_validated_api_onboarding_required"
  | "portal_validated_ct_connect_enablement_required"
  | "validated_live_api_and_portal";

export interface ProviderIntegration {
  id: string;
  name: string;
  country: "MX";
  kind: ProviderKind;
  status: ProviderStatus;
  channels: ProviderChannel[];
  aiSpec: string;
  vimportSpec: string | null;
  secretRefs: string[];
  capabilities: string[];
}

export interface ProviderCatalog {
  version: string;
  owner: string;
  providerConfigRoot: string;
  runtime: {
    frontend: string;
    backend: string;
    apiSpecRuntime: string;
    portalFallbackRuntime: string;
    secretStore: "server_env_only";
    vhubBaseUrlEnv: "VITE_VHUB_BASE_URL";
    vimportBaseUrlEnv: "VITE_VIMPORT_BASE_URL";
  };
  policy: {
    browserSecretsAllowed: false;
    frontendReadsSecrets: false;
    realTimePriceOwner: string;
    portalAutomationOwner: string;
    credentialTemplate: string;
  };
  integrations: ProviderIntegration[];
}

export const providerCatalog = catalog as ProviderCatalog;
export const PROVIDER_CONFIG_ROOT = providerCatalog.providerConfigRoot;
export const PROVIDER_INTEGRATIONS = providerCatalog.integrations;
export const ACTIVE_PROVIDER_IDS = PROVIDER_INTEGRATIONS.map((provider) => provider.id);

export const providerRuntimeEndpoints = {
  vhubBaseUrl: import.meta.env.VITE_VHUB_BASE_URL ?? "http://127.0.0.1:8787",
  vimportBaseUrl: import.meta.env.VITE_VIMPORT_BASE_URL ?? "http://127.0.0.1:8788",
} as const;

export const findProviderIntegration = (id: string) =>
  PROVIDER_INTEGRATIONS.find((provider) => provider.id === id);

export const getRealtimePriceProviders = () =>
  PROVIDER_INTEGRATIONS.filter((provider) => provider.capabilities.includes("price"));

export const getPortalFallbackProviders = () =>
  PROVIDER_INTEGRATIONS.filter((provider) => provider.channels.includes("portal_fallback"));
