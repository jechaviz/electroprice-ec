
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')        // Trim - from start of text
    .replace(/-+$/, '');       // Trim - from end of text
};

export const getProductUrl = (name: string, id: string): string => {
  return `/product/${slugify(name)}-${id}`;
};

export const productSlugMatchesId = (slug: string, id: string): boolean => {
  return id.length > 0 && (slug === id || slug.endsWith(`-${id}`));
};

export const getProductIdCandidatesFromSlug = (slug: string): string[] => {
  const parts = slug.split('-').filter(Boolean);
  const candidates: string[] = [];

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    candidates.push(parts.slice(index).join('-'));
  }

  candidates.push(slug);
  return Array.from(new Set(candidates));
};

export const getCategoryUrl = (id: string): string => {
  return `/catalog/${slugify(id)}`;
};
