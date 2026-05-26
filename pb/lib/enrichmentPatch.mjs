import { createHash } from 'node:crypto';
import { getIndexPayload, normalizeCatalogText, toArray, toObject } from './catalogIndex.mjs';
import { inferCategory, requiredSpecsFor } from './taxonomy.mjs';

export const ENRICHMENT_SCHEMA_VERSION = 'electroprice.ai_enrichment_patch.v1';
export const PROMPT_VERSION = 'semantic-catalog-v1';

export const FORBIDDEN_PRODUCT_FIELDS = new Set([
  'price',
  'stock',
  'availability',
  'available',
  'wholesaler_stock',
  'price_history',
  'best_price',
  'total_stock',
  'is_deal',
]);

export const ALLOWED_PRODUCT_FIELDS = new Set([
  'name',
  'brand',
  'category',
  'image_url',
  'description',
  'specs',
  'feature_score',
  'canonical_key',
  'model_number',
  'manufacturer_url',
  'gallery',
  'documents',
  'software_links',
  'canonical_ids',
  'provider_aliases',
  'missing_pieces',
  'content_score',
  'identity_confidence',
  'enrichment_status',
  'last_enriched_at',
  'search_text',
  'indexed_at',
]);

export const sha256 = (value) => `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;

const titleCase = (value) => normalizeCatalogText(value)
  .split(' ')
  .filter(Boolean)
  .map((part) => part.length <= 3 && /[a-z]/.test(part) ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1))
  .join(' ');

const cleanTitle = (product) => {
  const brand = String(product.brand || '').trim();
  const model = String(product.model_number || product.modelNumber || '').trim();
  const rawName = String(product.name || '').replace(/\b(oem|bulk|mayoreo|nuevo|stock|sku|modelo)\b/gi, ' ');
  const candidate = titleCase([brand, model, rawName].filter(Boolean).join(' '));
  const words = candidate.split(/\s+/);
  const deduped = words.filter((word, index) => words.findIndex((item) => item.toLowerCase() === word.toLowerCase()) === index);
  return deduped.join(' ').slice(0, 140);
};

const inferModel = (product) => {
  const text = [product.model_number, product.name, product.canonical_key].filter(Boolean).join(' ');
  const match = text.match(/\b[A-Z0-9][A-Z0-9-]{2,}(?:\s?[A-Z0-9-]{2,})?\b/);
  return match?.[0]?.replace(/\s+/g, ' ').trim() || product.model_number || '';
};

const buildDescription = (product, category) => {
  if (String(product.description || '').trim().length >= 80) return product.description;
  const brand = product.brand || 'Marca por confirmar';
  const title = cleanTitle(product);
  return `${title} de ${brand}, clasificado en ${category}. Perfil enriquecido para comparar precio, stock y especificaciones sin alterar disponibilidad del proveedor.`;
};

const normalizeSpecs = (product, taxonomy, category) => {
  const specs = { ...toObject(product.specs) };
  const hasSpecKey = (key) => {
    const normalized = normalizeCatalogText(key).replace(/\s+/g, '_');
    return Object.keys(specs).some((specKey) => normalizeCatalogText(specKey).replace(/\s+/g, '_') === normalized);
  };
  const source = normalizeCatalogText([product.name, product.description, product.model_number].filter(Boolean).join(' '));
  for (const key of requiredSpecsFor(taxonomy, category)) {
    if (hasSpecKey(key)) continue;
    if (key === 'brand' && product.brand) specs[key] = product.brand;
    if (key === 'model' && product.model_number) specs[key] = product.model_number;
    if (key === 'storage') {
      const match = source.match(/\b(\d{2,4})\s?(gb|tb)\b/);
      if (match) specs[key] = `${match[1]} ${match[2].toUpperCase()}`;
    }
    if (key === 'memory') {
      const match = source.match(/\b(\d{1,3})\s?gb\s?(ram|memoria)?\b/);
      if (match) specs[key] = `${match[1]} GB`;
    }
    if (key === 'size') {
      const match = source.match(/\b(\d{2,3})(?:\s|)?("|in|inch|pulgadas)\b/);
      if (match) specs[key] = `${match[1]}"`;
    }
  }
  return specs;
};

const contentLinksMissing = (value) => !Array.isArray(value) || value.length === 0;

export const assessProductContent = (product, taxonomy) => {
  const category = product.category || taxonomy.defaultCategory;
  const specs = toObject(product.specs);
  const normalizedKeys = new Set(Object.keys(specs).map((key) => normalizeCatalogText(key).replace(/\s+/g, '_')));
  const required = requiredSpecsFor(taxonomy, category);
  const missingSpecs = required.filter((key) => !normalizedKeys.has(key));
  const missingPieces = [
    ...missingSpecs.map((key) => `spec:${key}`),
    ...(!product.manufacturer_url ? ['manufacturer_url'] : []),
    ...(contentLinksMissing(product.gallery) && !product.image_url ? ['gallery'] : []),
    ...(contentLinksMissing(product.documents) ? ['documents'] : []),
    ...(contentLinksMissing(product.provider_aliases) ? ['provider_aliases'] : []),
    ...(!product.canonical_ids || Object.keys(product.canonical_ids).length === 0 ? ['canonical_ids'] : []),
  ];
  const specScore = required.length ? (required.length - missingSpecs.length) / required.length : 1;
  const sourceScore = [
    product.image_url || toArray(product.gallery).length,
    product.manufacturer_url,
    toArray(product.documents).length,
    toArray(product.provider_aliases).length,
    Object.keys(toObject(product.canonical_ids)).length,
  ].filter(Boolean).length / 5;
  const contentScore = Math.round((specScore * 0.6 + sourceScore * 0.4) * 100);
  const identityConfidence = Math.min(100, [
    product.canonical_key,
    product.model_number,
    product.brand,
    toObject(product.canonical_ids).mpn || toObject(product.canonical_ids).gtin,
    toArray(product.provider_aliases).length,
  ].filter(Boolean).length * 20);
  return { missingPieces, contentScore, identityConfidence };
};

export const buildDeterministicPatch = (product, taxonomy) => {
  const category = inferCategory(product, taxonomy);
  const now = new Date().toISOString();
  const fields = {
    name: cleanTitle(product),
    category,
    model_number: inferModel(product),
    description: buildDescription(product, category),
    specs: normalizeSpecs(product, taxonomy, category),
    gallery: toArray(product.gallery).length ? product.gallery : [product.image_url].filter(Boolean),
    canonical_ids: toObject(product.canonical_ids),
    provider_aliases: toArray(product.provider_aliases),
    last_enriched_at: now,
  };
  const assessed = assessProductContent({ ...product, ...fields }, taxonomy);
  Object.assign(fields, {
    missing_pieces: assessed.missingPieces,
    content_score: assessed.contentScore,
    identity_confidence: assessed.identityConfidence,
    enrichment_status: assessed.missingPieces.length ? 'enriched' : 'verified',
  });
  Object.assign(fields, getIndexPayload({ ...product, ...fields }));
  return sanitizePatchFields(fields);
};

export const sanitizePatchFields = (fields) => Object.fromEntries(
  Object.entries(fields)
    .filter(([key]) => ALLOWED_PRODUCT_FIELDS.has(key) && !FORBIDDEN_PRODUCT_FIELDS.has(key))
    .filter(([, value]) => value !== undefined)
);

export const buildPatchReceipt = ({ product, fields, sourceRefs = [], model = 'deterministic-taxonomy' }) => {
  const inputHash = sha256({ id: product.id, updated: product.updated, product });
  const patchHash = sha256(fields);
  return {
    schema_version: ENRICHMENT_SCHEMA_VERSION,
    prompt_version: PROMPT_VERSION,
    patch_id: sha256({ canonical_key: product.canonical_key || product.id, inputHash, patchHash }),
    product_id: product.id,
    canonical_key: product.canonical_key || '',
    status: 'proposed',
    confidence: fields.identity_confidence ? Math.max(0.45, fields.identity_confidence / 100) : 0.55,
    fields,
    forbidden_fields_omitted: true,
    source_refs: sourceRefs,
    input_hash: inputHash,
    patch_hash: patchHash,
    model,
  };
};
