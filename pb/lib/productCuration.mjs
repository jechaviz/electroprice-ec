import { getIndexPayload, normalizeCatalogText, toArray, toObject } from './catalogIndex.mjs';
import { classifyManualCategory } from './manualTaxonomy.mjs';

export const CURATION_SCHEMA_VERSION = 'electroprice.product_curation.v1';
export const DEFAULT_OBSOLETE_AFTER_DAYS = 30;

const fieldMap = {
  image_url: 'image_url',
  manufacturer_url: 'manufacturer_url',
  model_number: 'model_number',
  provider_aliases: 'provider_aliases',
  wholesaler_stock: 'wholesaler_stock',
};

const valueOf = (product, key) => product[key] ?? product[fieldMap[key]] ?? '';

const dateOnly = () => new Date().toISOString().slice(0, 10);

const cleanName = (product) => {
  const brand = String(product.brand || '').trim();
  const model = String(valueOf(product, 'model_number') || '').trim();
  const raw = String(product.name || '').replace(/\b(producto|mayoreo|nuevo|stock|sku)\b/gi, ' ');
  const candidate = [brand, model, raw].filter(Boolean).join(' ');
  const words = normalizeCatalogText(candidate).split(' ').filter(Boolean);
  const deduped = words.filter((word, index) => words.indexOf(word) === index);
  return deduped.map((word) => (
    word.length <= 3 && /[a-z]/.test(word) ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)
  )).join(' ').slice(0, 140);
};

const inferMeasurementSpecs = (product) => {
  const specs = { ...toObject(product.specs) };
  const text = [product.name, product.description, JSON.stringify(specs)]
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const number = '(\\d+(?:[.,]\\d+)?)';
  const weight = text.match(new RegExp(`\\b${number}\\s?(kg|g|gramos|lb)\\b`));
  const dimensions = text.match(new RegExp(`\\b${number}\\s?(?:x|\\u00d7)\\s?${number}\\s?(?:x|\\u00d7)\\s?${number}\\s?(cm|mm|in)\\b`));
  const cleanNumber = (value) => value.replace(',', '.');

  if (weight && !specs.weight) specs.weight = `${cleanNumber(weight[1])} ${weight[2]}`;
  if (dimensions && !specs.dimensions) {
    specs.dimensions = `${cleanNumber(dimensions[1])} x ${cleanNumber(dimensions[2])} x ${cleanNumber(dimensions[3])} ${dimensions[4]}`;
  }
  return specs;
};

const normalizeStockLocation = (stockItem) => ({
  providerId: stockItem.wholesalerId || stockItem.provider || '',
  warehouse: stockItem.warehouse || stockItem.branch || stockItem.sucursal || '',
  country: stockItem.country || 'MX',
  region: stockItem.region || stockItem.state || '',
  city: stockItem.city || '',
  stock: Math.max(0, Number(stockItem.stock) || 0),
  source: stockItem.warehouse || stockItem.branch || stockItem.sucursal ? 'provider' : 'provider_stock_without_branch',
});

export const summarizeStockLocations = (product) => (
  toArray(valueOf(product, 'wholesaler_stock'))
    .map(normalizeStockLocation)
    .filter((item) => item.providerId)
);

export const resolveAvailabilityPatch = (product, options = {}) => {
  const now = options.now || new Date().toISOString();
  const obsoleteAfterDays = Number(options.obsoleteAfterDays || DEFAULT_OBSOLETE_AFTER_DAYS);
  const totalStock = Number(product.total_stock ?? 0);
  const stock = toArray(valueOf(product, 'wholesaler_stock'));
  const hasProviderListing = stock.length > 0;
  const previousUnavailableSince = product.unavailable_since || '';

  if (totalStock > 0) {
    return {
      availability_status: 'active',
      last_offer_seen_at: now,
      unavailable_since: '',
      obsolete_at: '',
    };
  }

  const unavailableSince = previousUnavailableSince || now;
  const ageMs = new Date(now).getTime() - new Date(unavailableSince).getTime();
  const obsolete = !hasProviderListing || ageMs >= obsoleteAfterDays * 24 * 60 * 60 * 1000;

  return {
    availability_status: obsolete ? 'obsolete_candidate' : 'provider_unavailable',
    unavailable_since: unavailableSince,
    obsolete_at: obsolete ? now : '',
  };
};

export const buildProductCurationPatch = (product, options = {}) => {
  const manualCategory = classifyManualCategory(product);
  const stockLocations = summarizeStockLocations(product);
  const specs = inferMeasurementSpecs(product);
  const research = options.research || {};
  const fields = {
    name: cleanName(product) || product.name,
    category: manualCategory.legacyCategory,
    manual_category_path: manualCategory.path,
    semantic_category_path: research.semanticCategoryPath || manualCategory.path,
    category_review_status: manualCategory.reviewStatus,
    curation_version: manualCategory.taxonomyVersion,
    specs: { ...specs, ...(research.specs || {}) },
    stock_locations: stockLocations,
    curation_sources: toArray(research.sourceRefs),
    last_curated_at: options.now || new Date().toISOString(),
    ...resolveAvailabilityPatch(product, options),
  };

  if (research.name && research.confidence >= 0.8) fields.name = research.name;
  if (research.description) fields.description = research.description;
  if (research.manufacturerUrl) fields.manufacturer_url = research.manufacturerUrl;
  if (research.gallery?.length) fields.gallery = research.gallery;
  if (research.documents?.length) fields.documents = research.documents;
  if (research.measurements) fields.specs = { ...fields.specs, ...research.measurements };

  return {
    ...fields,
    ...getIndexPayload({ ...product, ...fields }),
  };
};

export const buildCurationReceipt = ({ product, fields, batchId, researchStatus = 'not_requested' }) => ({
  schema_version: CURATION_SCHEMA_VERSION,
  batch_id: batchId,
  product_id: product.id,
  status: fields.availability_status === 'obsolete_candidate' ? 'obsolete_candidate' : 'curated',
  fields,
  source_refs: fields.curation_sources || [],
  research_status: researchStatus,
  created_at: dateOnly(),
});
