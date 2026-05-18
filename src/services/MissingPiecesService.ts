import type { Product, WholesalerStock } from "../types";

export interface MissingPiecesAssessment {
  productId: string;
  canonicalKey: string;
  contentScore: number;
  identityConfidence: number;
  missingPieces: string[];
  recommendedActions: string[];
  enrichmentEstimateUsd: number;
}

export interface CanonicalOffer {
  providerId: string;
  wholesalePrice: number;
  retailPrice: number;
  marginRate: number;
  stock: number;
}

const REQUIRED_SPECS_BY_CATEGORY: Record<string, string[]> = {
  smartphones: ["display", "processor", "memory", "storage", "camera", "battery", "os"],
  laptops: ["display", "processor", "memory", "storage", "graphics", "battery", "weight"],
  headphones: ["type", "connectivity", "battery", "noise_cancelling", "weight"],
  cameras: ["sensor", "resolution", "video", "mount", "stabilization"],
  tvs: ["size", "panel", "resolution", "refresh_rate", "hdr", "ports"],
  gaming: ["platform", "processor", "storage", "display", "connectivity"],
};

const round = (value: number) => Math.round(value * 100) / 100;

const normalize = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toSpecKeySet = (specs: Record<string, string | number>) =>
  new Set(Object.keys(specs).map(normalize).map((key) => key.replace(/-/g, "_")));

const getCanonicalKey = (product: Product) =>
  product.canonicalKey || [product.brand, product.modelNumber || product.name].map(normalize).filter(Boolean).join(":");

const getRequiredSpecs = (category: string) => REQUIRED_SPECS_BY_CATEGORY[category] ?? ["model", "brand", "description"];

const hasLinks = (links?: unknown[]) => Array.isArray(links) && links.length > 0;

const estimateCost = (missingPieces: string[]) => {
  const unitCosts: Record<string, number> = {
    manufacturer_url: 0.2,
    gallery: 0.35,
    documents: 0.45,
    software_links: 0.35,
    provider_aliases: 0.3,
    canonical_ids: 0.25,
  };

  return round(missingPieces.reduce((sum, piece) => sum + (unitCosts[piece] ?? 0.18), 0));
};

export class MissingPiecesService {
  assess(product: Product): MissingPiecesAssessment {
    const specKeys = toSpecKeySet(product.specs);
    const requiredSpecs = getRequiredSpecs(product.category);
    const missingSpecs = requiredSpecs.filter((key) => !specKeys.has(key));
    const missingPieces = [
      ...missingSpecs.map((key) => `spec:${key}`),
      ...(!product.manufacturerUrl ? ["manufacturer_url"] : []),
      ...(!hasLinks(product.gallery) ? ["gallery"] : []),
      ...(!hasLinks(product.documents) ? ["documents"] : []),
      ...(!hasLinks(product.softwareLinks) ? ["software_links"] : []),
      ...(!product.providerAliases?.length ? ["provider_aliases"] : []),
      ...(!product.canonicalIds || Object.keys(product.canonicalIds).length === 0 ? ["canonical_ids"] : []),
    ];
    const filledSpecRatio = requiredSpecs.length
      ? (requiredSpecs.length - missingSpecs.length) / requiredSpecs.length
      : 1;
    const sourceSignals = [
      Boolean(product.manufacturerUrl),
      hasLinks(product.gallery),
      hasLinks(product.documents),
      hasLinks(product.softwareLinks),
      Boolean(product.providerAliases?.length),
      Boolean(product.canonicalIds && Object.keys(product.canonicalIds).length),
    ].filter(Boolean).length;
    const contentScore = Math.round((filledSpecRatio * 0.55 + (sourceSignals / 6) * 0.45) * 100);
    const identityConfidence = Math.round(
      [
        Boolean(product.canonicalKey),
        Boolean(product.modelNumber),
        Boolean(product.brand),
        Boolean(product.canonicalIds?.mpn || product.canonicalIds?.gtin),
        Boolean(product.providerAliases?.length),
      ].filter(Boolean).length * 20
    );

    return {
      productId: product.id,
      canonicalKey: getCanonicalKey(product),
      contentScore,
      identityConfidence,
      missingPieces,
      recommendedActions: this.recommendActions(missingPieces),
      enrichmentEstimateUsd: estimateCost(missingPieces),
    };
  }

  findBestOffer(stock: WholesalerStock[], marginRate = 0.15): CanonicalOffer | null {
    const available = stock
      .filter((offer) => offer.stock > 0 && offer.price > 0)
      .sort((a, b) => a.price - b.price);
    const best = available[0];
    if (!best) return null;

    return {
      providerId: best.wholesalerId,
      wholesalePrice: round(best.price),
      retailPrice: round(best.price * (1 + marginRate)),
      marginRate,
      stock: best.stock,
    };
  }

  groupByCanonicalProduct(products: Product[]) {
    return products.reduce<Record<string, Product[]>>((acc, product) => {
      const key = getCanonicalKey(product);
      acc[key] = [...(acc[key] ?? []), product];
      return acc;
    }, {});
  }

  private recommendActions(missingPieces: string[]) {
    const actions = new Set<string>();
    if (missingPieces.some((piece) => piece.startsWith("spec:"))) {
      actions.add("Scrape manufacturer technical specifications.");
    }
    if (missingPieces.includes("gallery")) {
      actions.add("Capture official product gallery images.");
    }
    if (missingPieces.includes("documents") || missingPieces.includes("software_links")) {
      actions.add("Collect official manuals, drivers, firmware, and support URLs.");
    }
    if (missingPieces.includes("provider_aliases") || missingPieces.includes("canonical_ids")) {
      actions.add("Resolve provider SKUs into a canonical product identity.");
    }
    return [...actions];
  }
}
