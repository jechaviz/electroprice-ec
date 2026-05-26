import { beforeEach, describe, expect, it, vi } from "vitest";
import { productsSignal } from "../signals/data.signals";
import { loadPocketBase } from "../utils/pocketBaseClient";
import { buildProductCatalogFilterForTest, ProductCatalogService } from "./ProductCatalogService";

describe("ProductCatalogService", () => {
  beforeEach(() => {
    productsSignal.value = [];
    vi.clearAllMocks();
  });

  it("omits sentinel-sized price caps from the initial public preview filter", async () => {
    const filter = buildProductCatalogFilterForTest({
      searchTerm: "",
      category: null,
      priceRange: [0, Number.MAX_SAFE_INTEGER],
      minRating: 0,
      smartFilterValues: {},
      dealsOnly: false,
      sortOption: "relevance",
      rates: { USD: 1, MXN: 20 },
      currency: "USD",
    }, true);

    expect(filter).toBe("total_stock > 0");
  });

  it("hides out-of-stock products by default in search and filters", async () => {
    const filter = buildProductCatalogFilterForTest({
      searchTerm: "laptop gamer",
      category: null,
      priceRange: [0, Number.MAX_SAFE_INTEGER],
      minRating: 0,
      smartFilterValues: {},
      dealsOnly: false,
      sortOption: "relevance",
      rates: { USD: 1, MXN: 20 },
      currency: "USD",
    }, true);

    expect(filter).toContain("total_stock > 0");
    expect(filter).toContain('search_text ~ "laptop" && search_text ~ "gamer"');
  });

  it("pushes brand smart filters to PocketBase", async () => {
    const filter = buildProductCatalogFilterForTest({
      searchTerm: "",
      category: "laptops",
      priceRange: [0, Number.MAX_SAFE_INTEGER],
      minRating: 0,
      smartFilterValues: { brand: ["Dell", "Lenovo"] },
      dealsOnly: false,
      sortOption: "relevance",
      rates: { USD: 1, MXN: 20 },
      currency: "USD",
    }, true);

    expect(filter).toContain('category = "laptops"');
    expect(filter).toContain('(brand = "Dell" || brand = "Lenovo")');
  });

  it("shows only out-of-stock products when the search explicitly requests them", async () => {
    const filter = buildProductCatalogFilterForTest({
      searchTerm: "laptop agotada",
      category: null,
      priceRange: [0, Number.MAX_SAFE_INTEGER],
      minRating: 0,
      smartFilterValues: {},
      dealsOnly: false,
      sortOption: "relevance",
      rates: { USD: 1, MXN: 20 },
      currency: "USD",
    }, true);

    expect(filter).toContain('search_text ~ "laptop"');
    expect(filter).toContain("total_stock <= 0");
  });

  it("retries transient catalog outages before surfacing an error", async () => {
    const getList = vi.fn()
      .mockRejectedValueOnce({ status: 503 })
      .mockResolvedValueOnce({ items: [] });

    vi.mocked(loadPocketBase).mockResolvedValue({
      collection: vi.fn().mockReturnValue({ getList }),
    } as any);

    const page = await ProductCatalogService.fetchProductPage({
      page: 1,
      perPage: 24,
      searchTerm: "",
      category: null,
      priceRange: [0, Number.MAX_SAFE_INTEGER],
      minRating: 0,
      smartFilterValues: {},
      dealsOnly: false,
      stockFilter: "available",
      sortOption: "relevance",
      rates: { USD: 1, MXN: 20 },
      currency: "USD",
    });

    expect(page.items).toEqual([]);
    expect(getList).toHaveBeenCalledTimes(2);
  });
});
