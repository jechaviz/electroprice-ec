import { describe, expect, it } from "vitest";
import type { Product } from "../types";
import { MissingPiecesService } from "./MissingPiecesService";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: "prod-canonical-1",
  name: "Dell XPS 13 9340",
  brand: "Dell",
  category: "laptops",
  imageUrl: "https://example.com/xps.jpg",
  description: "Canonical laptop profile.",
  specs: {
    display: "13.4 inch OLED",
    processor: "Intel Core Ultra 7",
    memory: "16 GB",
    storage: "1 TB SSD",
    graphics: "Intel Arc",
    battery: "55 Wh",
    weight: "1.2 kg",
  },
  avgRating: 4.7,
  reviewCount: 12,
  wholesalerStock: [
    { wholesalerId: "ingram_mexico", price: 21000, stock: 2 },
    { wholesalerId: "cva", price: 20500, stock: 4 },
  ],
  reviews: [],
  priceHistory: [],
  featureScore: 95,
  canonicalKey: "dell:xps-13-9340",
  modelNumber: "9340",
  manufacturerUrl: "https://www.dell.com/",
  gallery: ["https://example.com/xps-1.jpg"],
  documents: [{ label: "Manual", url: "https://example.com/manual.pdf", type: "manual" }],
  softwareLinks: [{ label: "Drivers", url: "https://example.com/drivers", type: "driver" }],
  canonicalIds: { mpn: "XPS-13-9340" },
  providerAliases: [{ providerId: "cva", sku: "XPS9340", confidence: 0.92 }],
  ...overrides,
});

describe("MissingPiecesService", () => {
  it("scores enriched canonical product profiles", () => {
    const service = new MissingPiecesService();
    const assessment = service.assess(product());

    expect(assessment.contentScore).toBe(100);
    expect(assessment.identityConfidence).toBe(100);
    expect(assessment.missingPieces).toEqual([]);
  });

  it("detects missing product-content pieces without treating price as content", () => {
    const service = new MissingPiecesService();
    const assessment = service.assess(product({
      manufacturerUrl: undefined,
      gallery: [],
      documents: [],
      softwareLinks: [],
      canonicalIds: {},
      providerAliases: [],
      specs: { processor: "Intel Core Ultra 7" },
      wholesalerStock: [],
    }));

    expect(assessment.missingPieces).toContain("manufacturer_url");
    expect(assessment.missingPieces).toContain("gallery");
    expect(assessment.missingPieces).toContain("provider_aliases");
    expect(assessment.missingPieces).not.toContain("price");
    expect(assessment.enrichmentEstimateUsd).toBeGreaterThan(0);
  });

  it("selects one best provider offer with the configured retail margin", () => {
    const service = new MissingPiecesService();
    const offer = service.findBestOffer(product().wholesalerStock, 0.15);

    expect(offer).toMatchObject({
      providerId: "cva",
      wholesalePrice: 20500,
      retailPrice: 23575,
      marginRate: 0.15,
    });
  });
});
