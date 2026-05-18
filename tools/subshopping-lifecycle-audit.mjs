import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.join(repoRoot, '.env');
const catalogPath = path.join(repoRoot, 'config', 'providers', 'catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const REQUEST_TIMEOUT_MS = 8000;

const portalCredentialProfiles = {
  cva: {
    url: 'CVA_PORTAL_URL',
    user: 'CVA_PORTAL_USER',
    password: 'CVA_PORTAL_PASSWORD',
  },
  ingram_mexico: {
    url: 'INGRAM_PORTAL_URL',
    user: 'INGRAM_PORTAL_USER',
    password: 'INGRAM_PORTAL_PASSWORD',
  },
  ctonline: {
    url: 'CTONLINE_PORTAL_URL',
    user: 'CTONLINE_PORTAL_USER',
    password: 'CTONLINE_PORTAL_PASSWORD',
  },
  syscom: {
    url: 'SYSCOM_PORTAL_URL',
    user: 'SYSCOM_PORTAL_USER',
    password: 'SYSCOM_PORTAL_PASSWORD',
  },
  tecnosinergia: {
    url: 'TECNOSINERGIA_PORTAL_URL',
    user: 'TECNOSINERGIA_PORTAL_USER',
    password: 'TECNOSINERGIA_PORTAL_PASSWORD',
  },
};

const parseDotEnv = (filePath) => {
  if (!existsSync(filePath)) return {};
  return readFileSync(filePath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) return acc;
    acc[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    return acc;
  }, {});
};

const hasValue = (env, key) => Boolean(env[key] && String(env[key]).trim().length > 0);

const supportsTracking = (provider) =>
  provider.capabilities.some((capability) =>
    ['waybills', 'shipping_guides', 'tracking', 'returns', 'invoices'].includes(capability)
  );

const inspectPortalSpec = (provider) => {
  if (!provider.vimportSpec) {
    return {
      hasPortalSpec: false,
      transactionAllowed: false,
      transactionDenied: false,
      transactionMode: 'no_portal_spec',
    };
  }

  const specPath = path.join(repoRoot, provider.vimportSpec);
  const text = existsSync(specPath) ? readFileSync(specPath, 'utf8') : '';
  const transactionActionPattern = /(add_to_cart|order_create|order_confirm)/;
  const transactionAllowed = new RegExp(`actions_allowed:\\s*\\[[^\\]]*${transactionActionPattern.source}`, 'm').test(text);
  const transactionDenied = new RegExp(`actions_denied:\\s*\\[[^\\]]*${transactionActionPattern.source}`, 'm').test(text);

  return {
    hasPortalSpec: true,
    transactionAllowed,
    transactionDenied,
    transactionMode: transactionAllowed ? 'transaction_allowed' : transactionDenied ? 'readonly_no_submit_gate' : 'unknown_gate',
  };
};

const redactUrl = (value) => {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return 'invalid-url';
  }
};

const probePortal = async (urlValue) => {
  if (!urlValue) return { status: 'not_configured' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(urlValue, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'ElectroPrice-Subshopping-Audit/1.0',
      },
    });

    return {
      status: 'reachable',
      httpStatus: response.status,
      redirected: response.status >= 300 && response.status < 400,
      url: redactUrl(urlValue),
    };
  } catch (error) {
    return {
      status: error?.name === 'AbortError' ? 'timeout' : 'unreachable',
      url: redactUrl(urlValue),
    };
  } finally {
    clearTimeout(timer);
  }
};

const getPortalReadiness = (env, providerId) => {
  const profile = portalCredentialProfiles[providerId];
  if (!profile) {
    return {
      configured: false,
      urlConfigured: false,
      credentialKeysPresent: false,
      profile: null,
    };
  }

  const urlConfigured = hasValue(env, profile.url);
  const credentialKeysPresent = hasValue(env, profile.user) && hasValue(env, profile.password);

  return {
    configured: urlConfigured && credentialKeysPresent,
    urlConfigured,
    credentialKeysPresent,
    profile,
  };
};

const getCycleDisposition = (provider, portalReadiness, portalSpec) => {
  const hasOrders = provider.capabilities.includes('orders');

  if (hasOrders && portalReadiness.configured && portalSpec.transactionAllowed) {
    return 'full_cycle_portal_transaction_ready';
  }

  if (hasOrders && portalReadiness.configured) {
    return 'full_cycle_credentialed_readonly_gate';
  }

  if (hasOrders) {
    return 'full_cycle_sandbox_spec_ready';
  }

  if (portalReadiness.configured) {
    return 'credentialed_transaction_discovery';
  }

  return 'catalog_only_provider_gate';
};

const env = parseDotEnv(envPath);
const rows = [];

for (const provider of catalog.integrations) {
  const portalReadiness = getPortalReadiness(env, provider.id);
  const portalSpec = inspectPortalSpec(provider);
  const portalProbe = portalReadiness.profile
    ? await probePortal(env[portalReadiness.profile.url])
    : { status: 'not_applicable' };
  const hasOrders = provider.capabilities.includes('orders');

  rows.push({
    id: provider.id,
    name: provider.name,
    status: provider.status,
    channels: provider.channels,
    hasOrders,
    hasTrackingSurface: supportsTracking(provider),
    hasPortalSpec: portalSpec.hasPortalSpec,
    portalTransactionMode: portalSpec.transactionMode,
    portalCredentialsReady: portalReadiness.configured,
    portalReachability: portalProbe.status,
    portalHttpStatus: portalProbe.httpStatus ?? null,
    cycleDisposition: getCycleDisposition(provider, portalReadiness, portalSpec),
  });
}

const summary = {
  totalProviders: rows.length,
  fullCyclePortalTransactionReady: rows.filter((row) => row.cycleDisposition === 'full_cycle_portal_transaction_ready').length,
  fullCycleCredentialedReadonlyGate: rows.filter((row) => row.cycleDisposition === 'full_cycle_credentialed_readonly_gate').length,
  fullCycleSandboxSpecReady: rows.filter((row) => row.cycleDisposition === 'full_cycle_sandbox_spec_ready').length,
  credentialedTransactionDiscovery: rows.filter((row) => row.cycleDisposition === 'credentialed_transaction_discovery').length,
  catalogOnlyProviderGate: rows.filter((row) => row.cycleDisposition === 'catalog_only_provider_gate').length,
  reachableCredentialedPortals: rows.filter((row) =>
    row.portalCredentialsReady && ['reachable', 'timeout'].includes(row.portalReachability)
  ).length,
};

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), summary, rows }, null, 2));
