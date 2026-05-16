
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

export const getCategoryUrl = (id: string): string => {
  return `/catalog/${slugify(id)}`;
};
