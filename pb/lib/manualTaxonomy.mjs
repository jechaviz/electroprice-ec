import { normalizeCatalogText } from './catalogIndex.mjs';
import { MANUAL_CATEGORY_TREE } from './manualCategoryTree.mjs';
import { MANUAL_CATEGORY_RULES } from './manualCategoryRules.mjs';

export const MANUAL_TAXONOMY_VERSION = 'manual-taxonomy-mx-2026-05-31-b204';

export { MANUAL_CATEGORY_TREE };
const rules = MANUAL_CATEGORY_RULES;
const categoryByPath = new Map(MANUAL_CATEGORY_TREE.map((category) => [category.path, category]));

export const getManualCategorySeeds = () => MANUAL_CATEGORY_TREE.map((category) => ({
  slug: category.path.split('/').at(-1),
  path: category.path,
  parent_slug: category.path.split('/').slice(0, -1).join('/'),
  name: category.name,
  legacy_category: category.legacyCategory,
  status: 'manual_verified',
  version: MANUAL_TAXONOMY_VERSION,
}));

export const classifyManualCategory = (product) => {
  const text = normalizeCatalogText([
    product.name,
    product.brand,
    product.category,
    product.model_number,
    product.description,
    JSON.stringify(product.specs || {}),
  ].filter(Boolean).join(' '));

  for (const [path, pattern] of rules) {
    if (!pattern.test(text)) continue;
    const category = categoryByPath.get(path);
    return {
      path,
      legacyCategory: category?.legacyCategory || product.category || 'laptops',
      reviewStatus: 'manual_rule_applied',
      confidence: 0.86,
      taxonomyVersion: MANUAL_TAXONOMY_VERSION,
    };
  }

  const fallback = MANUAL_CATEGORY_TREE.find((category) => category.legacyCategory === product.category);
  return {
    path: fallback?.path || 'computo/laptops',
    legacyCategory: fallback?.legacyCategory || product.category || 'laptops',
    reviewStatus: 'needs_manual_review',
    confidence: 0.45,
    taxonomyVersion: MANUAL_TAXONOMY_VERSION,
  };
};
