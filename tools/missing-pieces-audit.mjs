import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const dataPath = path.join(repoRoot, 'config', 'missing-pieces', 'electroprice-canonical-products.json');
const dataset = JSON.parse(readFileSync(dataPath, 'utf8'));
const forbiddenKeys = new Set(['price', 'stock', 'availability', 'available', 'wholesaler_stock', 'price_history']);

const fail = (message, details) => {
  console.error(`\n[missing-pieces-audit] FAIL: ${message}`);
  if (details) console.error(JSON.stringify(details, null, 2));
  process.exit(1);
};

const inspectForbidden = (value, trail = []) => {
  if (Array.isArray(value)) return value.flatMap((item, index) => inspectForbidden(item, [...trail, index]));
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, child]) => {
    const currentTrail = [...trail, key];
    const current = forbiddenKeys.has(key)
      ? [{ path: currentTrail.join('.'), valueType: typeof child }]
      : [];
    return [...current, ...inspectForbidden(child, currentTrail)];
  });
};

const duplicateKeys = dataset.products
  .map((product) => product.canonical_key)
  .filter((key, index, keys) => keys.indexOf(key) !== index);
const incomplete = dataset.products.filter((product) =>
  !product.canonical_key ||
  !product.manufacturer_url ||
  !product.model_number ||
  !product.documents?.length ||
  !product.software_links?.length ||
  !Object.keys(product.specs || {}).length
);
const forbidden = inspectForbidden(dataset.products);
const categories = [...new Set(dataset.products.map((product) => product.category))].sort();

if (duplicateKeys.length) fail('Duplicate canonical product keys.', duplicateKeys);
if (incomplete.length) fail('Canonical profiles are missing enrichment fields.', incomplete.map((item) => item.canonical_key));
if (forbidden.length) fail('Canonical profiles must not include live price, stock, or availability.', forbidden);

console.log(`[missing-pieces-audit] PASS: ${dataset.products.length} canonical profiles across ${categories.length} categories`);
console.log('[missing-pieces-audit] PASS: no price, stock, or availability fields embedded in product content');
