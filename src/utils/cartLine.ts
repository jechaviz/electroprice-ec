import type { CartItem, OrderItem } from "../types";

type SelectedOptions = Record<string, string>;

const selectedOptionEntries = (selectedOptions: SelectedOptions = {}) =>
  Object.entries(selectedOptions)
    .map(([key, value]) => [key.trim(), value.trim()] as const)
    .filter(([key, value]) => key.length > 0 && value.length > 0)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

export const normalizeSelectedOptions = (selectedOptions: SelectedOptions = {}): SelectedOptions =>
  Object.fromEntries(selectedOptionEntries(selectedOptions));

export const createCartLineId = (productId: string, selectedOptions: SelectedOptions = {}) => {
  const entries = selectedOptionEntries(selectedOptions);
  if (entries.length === 0) return productId;

  const optionKey = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return `${productId}::${optionKey}`;
};

export const getCartItemKey = (item: Pick<CartItem, "id" | "productId" | "selectedOptions">) =>
  item.id || createCartLineId(item.productId, item.selectedOptions);

export const getOrderItemKey = (item: Pick<OrderItem, "cartLineId" | "productId" | "selectedOptions">) =>
  item.cartLineId || createCartLineId(item.productId, item.selectedOptions);

export const selectedOptionsLabel = (selectedOptions?: SelectedOptions) =>
  selectedOptionEntries(selectedOptions)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" / ");
