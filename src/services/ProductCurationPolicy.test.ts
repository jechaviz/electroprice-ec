import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";
import { buildProductCurationPatch } from "../../pb/lib/productCuration.mjs";

describe("product curation policy", () => {
  it("classifies CCTV products into a nested manual category", () => {
    const category = classifyManualCategory({
      id: "camera-1",
      name: "Dahua DH-HAC-HDW1809 Camara Seguridad",
      brand: "Dahua",
      category: "laptops",
      specs: {},
    });

    expect(category.path).toBe("seguridad/cctv/camaras");
    expect(category.legacyCategory).toBe("cameras");
    expect(category.reviewStatus).toBe("manual_rule_applied");
  });

  it("preserves provider branch data when available", () => {
    const patch = buildProductCurationPatch({
      id: "product-1",
      name: "TP Link EAP773 Access Point",
      brand: "TP Link",
      category: "laptops",
      total_stock: 8,
      wholesaler_stock: [
        { wholesalerId: "cva", price: 10, stock: 8, warehouse: "Guadalajara" },
      ],
      specs: {},
    });

    expect(patch.availability_status).toBe("active");
    expect(patch.manual_category_path).toBe("redes/access-points");
    expect(patch.stock_locations[0]).toMatchObject({
      providerId: "cva",
      warehouse: "Guadalajara",
      country: "MX",
      stock: 8,
    });
  });

  it("marks unavailable products as obsolescence candidates after the threshold", () => {
    const patch = buildProductCurationPatch({
      id: "product-2",
      name: "Legacy cable",
      brand: "Generic",
      category: "laptops",
      total_stock: 0,
      wholesaler_stock: [],
      unavailable_since: "2026-01-01T00:00:00.000Z",
      specs: {},
    }, {
      now: "2026-05-27T00:00:00.000Z",
      obsoleteAfterDays: 30,
    });

    expect(patch.availability_status).toBe("obsolete_candidate");
    expect(patch.obsolete_at).toBe("2026-05-27T00:00:00.000Z");
  });

  it("extracts dimensions and weight from supplier text when specs are incomplete", () => {
    const patch = buildProductCurationPatch({
      id: "product-3",
      name: "Monitor 27 pulgadas 61 x 37 x 5 cm 4.5 kg",
      brand: "Generic",
      category: "monitors",
      total_stock: 1,
      wholesaler_stock: [{ wholesalerId: "ct", price: 10, stock: 1 }],
      specs: {},
    });

    expect(patch.specs.dimensions).toBe("61 x 37 x 5 cm");
    expect(patch.specs.weight).toBe("4.5 kg");
  });

  it("uses manually expanded nested categories for supplier-specific families", () => {
    expect(classifyManualCategory({
      name: "Epson T580100 cartucho de tinta",
      brand: "EPSON",
      category: "laptops",
    }).path).toBe("impresion/consumibles/tinta-toner");

    expect(classifyManualCategory({
      name: "Ubiquiti PBE 5AC Gen2 radioenlace",
      brand: "UBIQUITI",
      category: "laptops",
    }).path).toBe("redes/radioenlaces-antenas");

    expect(classifyManualCategory({
      name: "Panduit jack modular RJ45 Cat6",
      brand: "PANDUIT",
      category: "laptops",
    }).path).toBe("redes/cableado-estructurado");

    expect(classifyManualCategory({
      name: "Contpaqi Nominas licencia anual",
      brand: "CONTPAQi",
      category: "laptops",
    }).path).toBe("software/licencias");

    expect(classifyManualCategory({
      name: "TP Link Sm311lm transceptor",
      brand: "TP-LINK",
      category: "laptops",
    }).path).toBe("redes/transceptores-convertidores");

    expect(classifyManualCategory({
      name: "Microsoft Cfq7ttc0lh18p1ya",
      brand: "MICROSOFT",
      category: "laptops",
    }).path).toBe("software/licencias");

    expect(classifyManualCategory({
      name: "EZVIZ CS-BC1C/4K camara WiFi bateria",
      brand: "EZVIZ",
      category: "laptops",
    }).path).toBe("seguridad/cctv/camaras-ip-wifi");

    expect(classifyManualCategory({
      name: "Hikvision DS2CE16H0TITF(C) camara TurboHD",
      brand: "HIKVISION",
      category: "laptops",
    }).path).toBe("seguridad/cctv/camaras-turbohd");

    expect(classifyManualCategory({
      name: "Epson T04D100 caja de mantenimiento",
      brand: "EPSON",
      category: "laptops",
    }).path).toBe("impresion/consumibles/mantenimiento");

    expect(classifyManualCategory({
      name: "Nexxt AW161NXT02 placa keystone",
      brand: "NEXXT",
      category: "laptops",
    }).path).toBe("redes/cableado-estructurado/placas-keystone");

    expect(classifyManualCategory({
      name: "KSA BP-201M tensiometro de muneca",
      brand: "KSA",
      category: "laptops",
    }).path).toBe("salud/equipo-medico/monitoreo");

    expect(classifyManualCategory({
      name: "HP M0H50AL cabezal de impresion GT tricolor",
      brand: "HP",
      category: "laptops",
    }).path).toBe("impresion/consumibles/cabezales");

    expect(classifyManualCategory({
      name: "Dell CP5724S EcoLoop Pro Slim Backpack",
      brand: "DELL",
      category: "laptops",
    }).path).toBe("computo/accesorios/mochilas-fundas");

    expect(classifyManualCategory({
      name: "Creative Labs SB1870 Sound Blaster Audigy Fx V2",
      brand: "CREATIVE LABS",
      category: "laptops",
    }).path).toBe("computo/componentes/tarjetas-audio");

    expect(classifyManualCategory({
      name: "Acteck BR-937412 pasta termica Eolox Plus EX07",
      brand: "ACTECK",
      category: "laptops",
    }).path).toBe("computo/componentes/pasta-termica");

    expect(classifyManualCategory({
      name: "Go Safe PCO110 careta protectora infantil",
      brand: "GO SAFE",
      category: "laptops",
    }).path).toBe("seguridad/epp/proteccion-facial");
  });

  it("accepts researched manual category overrides within PocketBase select values", () => {
    const patch = buildProductCurationPatch({
      id: "product-4",
      name: "Saxxon VB-03",
      brand: "SAXXON",
      category: "laptops",
      total_stock: 2,
      wholesaler_stock: [{ wholesalerId: "tecnosinergia", stock: 2, price: 10 }],
      specs: {},
    }, {
      research: {
        confidence: 0.91,
        name: "Saxxon VB-03 par de transceptores pasivos video balun 4MP",
        manualCategoryPath: "seguridad/cctv/accesorios-cableado",
        legacyCategory: "cameras",
        categoryReviewStatus: "manual_verified",
      },
    });

    expect(patch.name).toBe("Saxxon VB-03 par de transceptores pasivos video balun 4MP");
    expect(patch.category).toBe("cameras");
    expect(patch.manual_category_path).toBe("seguridad/cctv/accesorios-cableado");
    expect(patch.category_review_status).toBe("manual_verified");
  });

  it("falls back when researched review status is outside PocketBase choices", () => {
    const patch = buildProductCurationPatch({
      id: "product-5",
      name: "ADATA C100 power bank",
      brand: "ADATA",
      category: "laptops",
      total_stock: 1,
      wholesaler_stock: [{ wholesalerId: "ct", stock: 1, price: 10 }],
      specs: {},
    }, {
      research: {
        categoryReviewStatus: "manual_web_researched",
      },
    });

    expect(patch.category_review_status).toBe("manual_rule_applied");
  });
});
