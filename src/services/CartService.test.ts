import { beforeEach, describe, expect, it } from "vitest";
import { currentUserSignal } from "../signals/auth.signals";
import { productsSignal } from "../signals/data.signals";
import { isCartDrawerOpenSignal, toastSignal } from "../signals/ui.signals";
import type { Product, User } from "../types";
import { getCartItemKey } from "../utils/cartLine";
import { CartService } from "./CartService";

const makeProduct = (): Product => ({
  id: "prod-1",
  name: "Laptop Pro",
  brand: "Electro",
  category: "laptops",
  imageUrl: "https://example.com/laptop.png",
  description: "Demo product",
  specs: {},
  avgRating: 4.5,
  reviewCount: 10,
  wholesalerStock: [{ wholesalerId: "wh-1", price: 100, stock: 3 }],
  reviews: [],
  options: [
    { name: "Color", values: ["Black", "Silver"] },
  ],
  priceHistory: [],
  featureScore: 1,
});

const makeUser = (): User => ({
  id: "mock_user",
  name: "Demo User",
  email: "user@example.com",
  avatarUrl: "",
  role: "user",
  favorites: [],
  reviews: [],
  cart: [],
  orderIds: [],
  addresses: [],
  paymentMethods: [],
});

describe("CartService", () => {
  beforeEach(() => {
    currentUserSignal.value = makeUser();
    productsSignal.value = [makeProduct()];
    isCartDrawerOpenSignal.value = false;
    toastSignal.value = null;
  });

  it("keeps variants of the same product in separate cart lines", async () => {
    await CartService.addToCart("prod-1", 1, { Color: "Black" });
    await CartService.addToCart("prod-1", 1, { Color: "Silver" });

    const cart = currentUserSignal.value?.cart ?? [];

    expect(cart).toHaveLength(2);
    expect(cart.map(getCartItemKey)).toEqual([
      "prod-1::Color=Black",
      "prod-1::Color=Silver",
    ]);
  });

  it("updates and removes only the targeted cart line", async () => {
    await CartService.addToCart("prod-1", 1, { Color: "Black" });
    await CartService.addToCart("prod-1", 1, { Color: "Silver" });

    const firstLineId = getCartItemKey(currentUserSignal.value!.cart[0]);
    await CartService.updateCartQuantity(firstLineId, 2);

    expect(currentUserSignal.value?.cart.map(item => item.quantity)).toEqual([2, 1]);

    await CartService.removeFromCart(firstLineId);

    expect(currentUserSignal.value?.cart).toHaveLength(1);
    expect(currentUserSignal.value?.cart[0].selectedOptions).toEqual({ Color: "Silver" });
  });

  it("guards stock across multiple variant lines of the same product", async () => {
    await CartService.addToCart("prod-1", 2, { Color: "Black" });
    await CartService.addToCart("prod-1", 2, { Color: "Silver" });

    const cart = currentUserSignal.value?.cart ?? [];

    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
    expect(toastSignal.value?.type).toBe("error");
  });

  it("rejects invalid quantities before mutating the cart", async () => {
    await CartService.addToCart("prod-1", Number.NaN, { Color: "Black" });

    expect(currentUserSignal.value?.cart).toEqual([]);
    expect(toastSignal.value?.type).toBe("error");
  });
});
