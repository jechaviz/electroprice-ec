import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You research electronics product catalog details.
Return strict JSON only. Schema:
{"items":[{"product_id":"","confidence":0.0,"name":"","description":"","semanticCategoryPath":"","manufacturerUrl":"","gallery":[],"documents":[],"specs":{},"measurements":{},"sourceRefs":[{"title":"","url":"","type":""}],"blockers":[]}]}
Prefer manufacturer pages, manuals, official distributors, and reputable marketplaces.
Do not return live price, stock, availability, or seller-specific claims.`;

const parseJson = (text) => {
  const match = String(text || '').match(/\{[\s\S]*\}/);
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
  model_number: product.model_number,
  category: product.category,
  specs: product.specs,
  canonical_ids: product.canonical_ids,
  provider_aliases: product.provider_aliases,
});

const groundingSources = (response) => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .map((chunk) => chunk.web)
    .filter((web) => web?.uri)
    .map((web) => ({ title: web.title || web.uri, url: web.uri, type: 'grounding' }));
};

export const researchProductsWithGemini = async ({ apiKey, products, model = 'gemini-2.5-flash', enabled = false }) => {
  if (!enabled || !apiKey || products.length === 0) return new Map();

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: JSON.stringify({ products: products.map(compactProduct) }),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
    },
  });
  const groundedSources = groundingSources(response);
  const parsed = parseJson(response.text);
  const result = new Map();

  for (const item of parsed.items || []) {
    if (!item.product_id) continue;
    result.set(item.product_id, {
      ...item,
      confidence: Number(item.confidence) || 0.5,
      sourceRefs: [...(Array.isArray(item.sourceRefs) ? item.sourceRefs : []), ...groundedSources],
    });
  }

  return result;
};
