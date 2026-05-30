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
    expect(patch.manual_category_path).toBe("redes/access-points/wifi-7");
    expect(patch.stock_locations[0]).toMatchObject({
      providerId: "cva",
      warehouse: "Guadalajara",
      country: "MX",
      stock: 8,
    });
  });

  it("expands supplier branch summaries into stock locations", () => {
    const patch = buildProductCurationPatch({
      id: "product-1b",
      name: "Anviz AN-C2Slim-BT",
      brand: "Anviz",
      category: "laptops",
      total_stock: 5,
      wholesaler_stock: [{ wholesalerId: "ctonline", price: 151.65, stock: 5 }],
      specs: { "Stock Location If Available": "D2A:4,DFA:1", Provider: "ctonline" },
    });

    expect(patch.stock_locations).toEqual([
      expect.objectContaining({ providerId: "ctonline", warehouse: "D2A", stock: 4 }),
      expect.objectContaining({ providerId: "ctonline", warehouse: "DFA", stock: 1 }),
    ]);
  });

  it("uses researched provider branches when applying manual enrichment", () => {
    const patch = buildProductCurationPatch({
      id: "product-1c",
      name: "Pacific Soft SF020",
      brand: "Pacific Soft",
      category: "software",
      total_stock: 6,
      wholesaler_stock: [{ wholesalerId: "ctonline", price: 4968.98, stock: 6 }],
      specs: {},
    }, {
      research: {
        specs: {
          providerBranches: [
            { providerId: "ctonline", warehouseCode: "D2A", stock: 4 },
            { providerId: "ctonline", warehouseCode: "DFA", stock: 2 },
          ],
        },
      },
    });

    expect(patch.stock_locations.map((item) => `${item.warehouse}:${item.stock}`)).toEqual(["D2A:4", "DFA:2"]);
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
    }).path).toBe("redes/transceptores-convertidores/modulos-sfp/sfp-1g/multimodo-1000base-sx");

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
    }).path).toBe("computo/accesorios/mochilas-fundas/mochilas-laptop");

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

    expect(classifyManualCategory({
      name: "TP-Link Tapo T300 sensor de fuga de agua",
      brand: "TP-LINK",
      category: "laptops",
    }).path).toBe("domotica/sensores/fugas-agua");

    expect(classifyManualCategory({
      name: "Hisense HMMS3411DSV horno de microondas",
      brand: "Hisense",
      category: "laptops",
    }).path).toBe("hogar/electrodomesticos/microondas");

    expect(classifyManualCategory({
      name: "EZVIZ CSH9C10MP camara PT doble lente",
      brand: "EZVIZ",
      category: "laptops",
    }).path).toBe("seguridad/cctv/camaras-ip-wifi");

    expect(classifyManualCategory({
      name: "Evotec EV-3006 lector codigo de barras",
      brand: "EVOTEC",
      category: "laptops",
    }).path).toBe("punto-de-venta/lectores-codigo-barras");

    expect(classifyManualCategory({
      name: "Microsoft EP2-06687 Office Home Business 2024",
      brand: "MICROSOFT",
      category: "laptops",
    }).path).toBe("software/licencias");

    expect(classifyManualCategory({
      name: "Laces LA100TE1224X50 tuerca enjaulada 12-24",
      brand: "LACES",
      category: "laptops",
    }).path).toBe("infraestructura/racks-accesorios/herrajes");

    expect(classifyManualCategory({
      name: "PCM 10B4 papel bond para plotter 0.91 x 50",
      brand: "PCM",
      category: "laptops",
    }).path).toBe("impresion/consumibles/papel-plotter");

    expect(classifyManualCategory({
      name: "EZVIZ DL05 cerradura inteligente",
      brand: "EZVIZ",
      category: "laptops",
    }).path).toBe("seguridad/control-acceso/cerraduras-inteligentes");

    expect(classifyManualCategory({
      name: "Manhattan 410144 pulsera antiestatica ESD",
      brand: "MANHATTAN",
      category: "laptops",
    }).path).toBe("computo/accesorios/herramientas-esd");

    expect(classifyManualCategory({
      name: "TopVision TBDL500A camara HD TVI AHD CVI",
      brand: "TOPVISION",
      category: "laptops",
    }).path).toBe("seguridad/cctv/camaras-turbohd/bullet/5mp-dual-light");

    expect(classifyManualCategory({
      name: "Saxxon SUA-KIT/XVR1E04-I/4-B10P-0280B kit de videovigilancia",
      brand: "SAXXON",
      category: "laptops",
    }).path).toBe("seguridad/cctv/kits-vigilancia");

    expect(classifyManualCategory({
      name: "Huawei Band 10 55020EKU smartwatch",
      brand: "HUAWEI",
      category: "laptops",
    }).path).toBe("wearables/smartwatches");

    expect(classifyManualCategory({
      name: "Perfect Choice PC-110583 microfono cardioide",
      brand: "PERFECT CHOICE",
      category: "laptops",
    }).path).toBe("audio/microfonos");

    expect(classifyManualCategory({
      name: "Evotec EV-3023C rollos de papel termico 57x36",
      brand: "EVOTEC",
      category: "laptops",
    }).path).toBe("punto-de-venta/consumibles/rollos-termicos");

    expect(classifyManualCategory({
      name: "Logitech Spotlight presentation remote",
      brand: "LOGITECH",
      category: "laptops",
    }).path).toBe("computo/perifericos/presentadores");

    expect(classifyManualCategory({
      name: "Canon BH-10 + CH-10 kit cabezal",
      brand: "CANON",
      category: "laptops",
    }).path).toBe("impresion/consumibles/cabezales");

    expect(classifyManualCategory({
      name: "NECNON NSW-101 smartwatch",
      brand: "NECNON",
      category: "laptops",
    }).path).toBe("wearables/smartwatches");

    expect(classifyManualCategory({
      name: "Vortred V-930280 bocinas gamer Bluetooth RGB",
      brand: "VORTRED",
      category: "gaming",
    }).path).toBe("audio/bocinas");

    expect(classifyManualCategory({
      name: "ADATA High Endurance microSD 64GB MEMDAT7020",
      brand: "ADATA",
      category: "laptops",
    }).path).toBe("computo/almacenamiento/memorias-flash");

    expect(classifyManualCategory({
      name: "Targus PA410S-1 DEFCON SCL serialized cable lock",
      brand: "TARGUS",
      category: "laptops",
    }).path).toBe("accesorios/seguridad-fisica");

    expect(classifyManualCategory({
      name: "Dell PowerEdge R760xs servidor rack",
      brand: "DELL",
      category: "laptops",
    }).path).toBe("computo/servidores/rack");

    expect(classifyManualCategory({
      name: "Stylos STSCM03A scooter electrico M3",
      brand: "STYLOS",
      category: "gaming",
    }).path).toBe("movilidad/scooters-electricos");

    expect(classifyManualCategory({
      name: "Smartbitt SNMP Administrador tarjeta de red UPS",
      brand: "SMARTBITT",
      category: "laptops",
    }).path).toBe("energia/accesorios-ups/tarjetas-snmp");

    expect(classifyManualCategory({
      name: "Hisense HS2100 barra de sonido con subwoofer",
      brand: "Hisense",
      category: "laptops",
    }).path).toBe("audio/barras-sonido");

    expect(classifyManualCategory({
      name: "Perfect Choice EL-994312 funda laptop 14 reversible",
      brand: "PERFECT CHOICE",
      category: "laptops",
    }).path).toBe("computo/accesorios/mochilas-fundas");

    expect(classifyManualCategory({
      name: "Logitech Zone 300 headset Bluetooth",
      brand: "LOGITECH",
      category: "laptops",
    }).path).toBe("audio/audifonos");

    expect(classifyManualCategory({
      name: "Multimedia Screens MSC-305 pantalla de proyeccion 170 pulgadas",
      brand: "MULTIMEDIA SCREENS",
      category: "laptops",
    }).path).toBe("video/accesorios-proyeccion");

    expect(classifyManualCategory({
      name: "Evotec EV-3012C etiquetas termicas 10x15cm",
      brand: "EVOTEC",
      category: "laptops",
    }).path).toBe("punto-de-venta/consumibles/etiquetas-termicas");

    expect(classifyManualCategory({
      name: "Brother BU229CL transfer belt unit",
      brand: "BROTHER",
      category: "laptops",
    }).path).toBe("impresion/consumibles/unidades-transferencia");

    expect(classifyManualCategory({
      name: "Techzone TZAPL03 apuntador laser indicador 50 m",
      brand: "TECHZONE",
      category: "laptops",
    }).path).toBe("computo/perifericos/presentadores");

    expect(classifyManualCategory({
      name: "Creative Labs Stage V2 soundbar",
      brand: "CREATIVE LABS",
      category: "laptops",
    }).path).toBe("audio/barras-sonido");

    expect(classifyManualCategory({
      name: "CyberPower RMCARD205 remote management card",
      brand: "CYBERPOWER",
      category: "gaming",
    }).path).toBe("energia/accesorios-ups/tarjetas-snmp");

    expect(classifyManualCategory({
      name: "Huawei Band 10 55020EKX Aluminum White",
      brand: "HUAWEI",
      category: "laptops",
    }).path).toBe("wearables/smartwatches");

    expect(classifyManualCategory({
      name: "Kensington K64448WW NanoSaver dual head laptop lock",
      brand: "KENSINGTON",
      category: "laptops",
    }).path).toBe("accesorios/seguridad-fisica");

    expect(classifyManualCategory({
      name: "ADATA UD512GEX3L1-C Premier Extreme microSD SD7.1 Express",
      brand: "ADATA",
      category: "laptops",
    }).path).toBe("computo/almacenamiento/memorias-flash");

    expect(classifyManualCategory({
      name: "Nexxt AW250NXT11 herramienta de impacto punchdown 110/88",
      brand: "NEXXT",
      category: "laptops",
    }).path).toBe("redes/herramientas-cableado");

    expect(classifyManualCategory({
      name: "HP ScanJet Pro 3000 s4 6FW07A escaner documental",
      brand: "HP",
      category: "laptops",
    }).path).toBe("impresion/escaneres");

    expect(classifyManualCategory({
      name: "Dell SB521A slim soundbar para monitor",
      brand: "DELL",
      category: "laptops",
    }).path).toBe("audio/barras-sonido");

    expect(classifyManualCategory({
      name: "Meriva MOB-203D camara IP bullet PoE 2MP",
      brand: "MERIVA",
      category: "laptops",
    }).path).toBe("seguridad/cctv/camaras-ip-poe");

    expect(classifyManualCategory({
      name: "Uniarch UAC-T112-F28-X-H camara analogica TVI AHD CVI CVBS",
      brand: "UNIARCH",
      category: "laptops",
    }).path).toBe("seguridad/cctv/camaras-turbohd");

    expect(classifyManualCategory({
      name: "Anviz AN-GC150 control de acceso huella RFID",
      brand: "ANVIZ",
      category: "laptops",
    }).path).toBe("seguridad/control-acceso/biometricos");

    expect(classifyManualCategory({
      name: "Nexxt AW222NXT62 NPM-DH2UB organizador de cable rack 2U",
      brand: "NEXXT",
      category: "laptops",
    }).path).toBe("infraestructura/racks-accesorios/organizadores-cable");

    expect(classifyManualCategory({
      name: "TP-Link Tapo RV20 Max robot aspirador 5300Pa LiDAR",
      brand: "TP LINK",
      category: "laptops",
    }).path).toBe("hogar/electrodomesticos/aspiradoras-robot");

    expect(classifyManualCategory({
      name: "TopVision TDDL200A camara HD turret 2MP TVI AHD CVI",
      brand: "TOPVISION",
      category: "laptops",
    }).path).toBe("seguridad/cctv/camaras-turbohd/turret/2mp-dual-light");

    expect(classifyManualCategory({
      name: "HP ScanJet Pro 2000 s2 6FW06A escaner documental",
      brand: "HP",
      category: "laptops",
    }).path).toBe("impresion/escaneres");

    expect(classifyManualCategory({
      name: "Techzone TZLBP29-V mochila Style backpack",
      brand: "TECHZONE",
      category: "laptops",
    }).path).toBe("computo/accesorios/mochilas-fundas");

    expect(classifyManualCategory({
      name: "Perfect Choice PC-112716 bafle dual Miniglow",
      brand: "PERFECT CHOICE",
      category: "laptops",
    }).path).toBe("audio/bocinas");

    expect(classifyManualCategory({
      name: "Verbatim 94776 CD-R 700MB 52x 80 min",
      brand: "VERBATIM",
      category: "laptops",
    }).path).toBe("computo/almacenamiento/medios-opticos");

    expect(classifyManualCategory({
      name: "Qian QOC-143SK cajon de dinero POS",
      brand: "QIAN",
      category: "laptops",
    }).path).toBe("punto-de-venta/cajones-dinero");

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

  it("accepts high-confidence manual brand corrections", () => {
    const patch = buildProductCurationPatch({
      id: "product-6",
      name: "Electroprice CSH80X",
      brand: "ElectroPrice",
      category: "cameras",
      model_number: "CSH80X",
      total_stock: 1,
      wholesaler_stock: [{ wholesalerId: "syscom", stock: 1, price: 157 }],
      specs: {},
    }, {
      research: {
        confidence: 0.95,
        brand: "EZVIZ",
        name: "EZVIZ H80x Dual CS-H80X camara PT WiFi 4K exterior",
        manualCategoryPath: "seguridad/cctv/camaras-ip-wifi/pt-doble-lente/4k-exterior",
        categoryReviewStatus: "manual_verified",
      },
    });

    expect(patch.brand).toBe("EZVIZ");
    expect(patch.search_text).toContain("ezviz");
  });
});
