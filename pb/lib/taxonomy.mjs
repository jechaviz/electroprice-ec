import fs from 'node:fs';
import path from 'node:path';
import { normalizeCatalogText, toObject } from './catalogIndex.mjs';

export const loadTaxonomy = (cwd = process.cwd()) => {
  const filePath = path.resolve(cwd, 'config/catalog/product_taxonomy.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

export const categoryIds = (taxonomy) => taxonomy.categories.map((category) => category.id);

export const findCategory = (taxonomy, categoryId) =>
  taxonomy.categories.find((category) => category.id === categoryId);

export const inferCategory = (product, taxonomy) => {
  const current = product.category;

  const text = normalizeCatalogText([
    product.name,
    product.brand,
    product.category,
    product.description,
    product.model_number,
    Object.values(toObject(product.specs)).join(' '),
  ].filter(Boolean).join(' '));

  let best = { id: taxonomy.defaultCategory, score: 0 };
  if (categoryIds(taxonomy).includes(current)) {
    best = { id: current, score: 0 };
  }

  for (const category of taxonomy.categories) {
    const aliases = [category.id, category.label, ...(category.aliases || [])];
    const score = aliases.reduce((sum, alias) => {
      const normalizedAlias = normalizeCatalogText(alias);
      if (!normalizedAlias) return sum;
      return sum + (text.includes(normalizedAlias) ? normalizedAlias.split(' ').length : 0);
    }, 0);
    if (score > best.score) best = { id: category.id, score };
  }

  return best.id;
};

export const requiredSpecsFor = (taxonomy, categoryId) =>
  findCategory(taxonomy, categoryId)?.requiredSpecs || findCategory(taxonomy, taxonomy.defaultCategory)?.requiredSpecs || [];
