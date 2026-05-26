import { GoogleGenAI } from '@google/genai';
import { sanitizePatchFields } from './enrichmentPatch.mjs';

const SYSTEM_INSTRUCTION = `You enrich an electronics catalog.
Return strict JSON only: {"items":[{"product_id":"","confidence":0.0,"fields":{},"source_refs":[],"blockers":[]}]}
Allowed fields: name, brand, category, image_url, description, specs, feature_score, canonical_key, model_number,
manufacturer_url, gallery, documents, software_links, canonical_ids, provider_aliases.
Never return price, stock, availability, wholesaler_stock, price_history, best_price, total_stock, or is_deal.
Do not invent manufacturer facts. If evidence is weak, keep blockers and only normalize taxonomy/title.`;

const parseJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { items: [] };
  try {
    return JSON.parse(match[0]);
  } catch {
    return { items: [] };
  }
};

const compactProduct = (product) => ({
  product_id: product.id,
  name: product.name,
  brand: product.brand,
  category: product.category,
  model_number: product.model_number,
  description: product.description,
  specs: product.specs,
  image_url: product.image_url,
  canonical_key: product.canonical_key,
  canonical_ids: product.canonical_ids,
  provider_aliases: product.provider_aliases,
  missing_pieces: product.missing_pieces,
});

export const enrichWithGemini = async ({ apiKey, products, taxonomy, model = 'gemini-2.5-flash' }) => {
  if (!apiKey || products.length === 0) return new Map();

  const ai = new GoogleGenAI({ apiKey });
  const prompt = JSON.stringify({
    taxonomy,
    products: products.map(compactProduct),
  });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });
  const parsed = parseJson(response.text || '');
  const patches = new Map();

  for (const item of parsed.items || []) {
    if (!item.product_id || !item.fields) continue;
    patches.set(item.product_id, {
      fields: sanitizePatchFields(item.fields),
      confidence: Number(item.confidence) || 0.5,
      sourceRefs: Array.isArray(item.source_refs) ? item.source_refs : [],
      blockers: Array.isArray(item.blockers) ? item.blockers : [],
      model,
    });
  }

  return patches;
};
