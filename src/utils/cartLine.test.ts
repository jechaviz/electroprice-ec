import { describe, expect, it } from "vitest";
import { createCartLineId, getCartItemKey, getOrderItemKey, normalizeSelectedOptions, selectedOptionsLabel } from "./cartLine";

describe("cartLine utilities", () => {
  it("builds stable ids independent of option insertion order", () => {
    const first = createCartLineId("prod-1", { Color: "Black", Storage: "1 TB" });
    const second = createCartLineId("prod-1", { Storage: "1 TB", Color: "Black" });

    expect(first).toBe(second);
    expect(first).toContain("Color=Black");
    expect(first).toContain("Storage=1%20TB");
  });

  it("keeps the legacy product id for lines without options", () => {
    expect(createCartLineId("prod-1")).toBe("prod-1");
    expect(getCartItemKey({ productId: "prod-1" })).toBe("prod-1");
    expect(getOrderItemKey({ productId: "prod-1" })).toBe("prod-1");
  });

  it("normalizes blank and padded options for storage and display", () => {
    const normalized = normalizeSelectedOptions({ " Color ": " Black ", Empty: " ", "": "ignored" });

    expect(normalized).toEqual({ Color: "Black" });
    expect(selectedOptionsLabel(normalized)).toBe("Color: Black");
  });
});
