import { describe, expect, it } from "vitest";
import { buildProductCurationPatch } from "../../pb/lib/productCuration.mjs";

describe("product curation stock overrides", () => {
  it("applies audited manual wholesaler stock overrides", () => {
    const patch = buildProductCurationPatch({
      id: "product-1d",
      name: "Zebra Z-Perform 2000D 10010028",
      brand: "ZEBRA",
      category: "laptops",
      total_stock: 0,
      wholesaler_stock: [
        { wholesalerId: "ctonline", providerSku: "ACCZBR2190", price: 45.55, stock: 0 },
      ],
      specs: {},
    }, {
      research: {
        wholesalerStock: [
          { wholesalerId: "ctonline", providerSku: "ACCETI340", price: 69.09, stock: 17 },
        ],
        specs: {
          providerBranches: [
            { providerId: "ctonline", warehouseCode: "D2A", stock: 8 },
            { providerId: "ctonline", warehouseCode: "ZAC", stock: 5 },
          ],
        },
      },
    });

    expect(patch.wholesaler_stock[0]).toMatchObject({ providerSku: "ACCETI340", stock: 17 });
    expect(patch.total_stock).toBe(17);
    expect(patch.availability_status).toBe("active");
    expect(patch.stock_locations.map((item) => `${item.warehouse}:${item.stock}`)).toEqual(["D2A:8", "ZAC:5"]);
  });
});
