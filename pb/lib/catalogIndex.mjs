export const normalizeCatalogText = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return [];
  }
};

export const toObject = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  return {};
};

const fieldValues = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(fieldValues);
  if (typeof value === 'object') return Object.values(value).flatMap(fieldValues);
  return [String(value)];
};

export const getIndexPayload = (product) => {
  const stock = toArray(product.wholesaler_stock);
  const totalStock = stock.reduce((sum, item) => sum + Math.max(0, Number(item.stock) || 0), 0);
  const availablePrices = stock
    .filter((item) => Number(item.stock) > 0)
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  const fallbackPrices = stock
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  const prices = availablePrices.length > 0 || totalStock > 0 ? availablePrices : fallbackPrices;
  const bestPrice = prices.length ? Math.min(...prices) : null;
  const recentPrices = toArray(product.price_history)
    .slice(-30)
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  const isRecentDrop = bestPrice && recentPrices.length > 1 ? bestPrice < Math.max(...recentPrices) * 0.9 : false;
  const searchText = normalizeCatalogText([
    product.name,
    product.brand,
    product.category,
    product.model_number,
    product.canonical_key,
    product.deal_tag,
    product.smart_tag,
    product.description,
    ...fieldValues(product.specs),
    ...fieldValues(product.canonical_ids),
    ...fieldValues(product.provider_aliases),
  ].filter(Boolean).join(' '));

  return {
    search_text: searchText,
    best_price: bestPrice,
    total_stock: totalStock,
    is_deal: Boolean(product.deal_tag || product.old_price || isRecentDrop),
    indexed_at: new Date().toISOString(),
  };
};
