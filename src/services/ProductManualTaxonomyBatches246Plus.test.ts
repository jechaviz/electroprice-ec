import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch246Cases = [
  ["Smartwatch Amazfit Bip 3 Pro rosa GPS 5 ATM ACCAMZ210", "AMAZFIT", "electronica/wearables/smartwatches/gps/amazfit-bip-3-pro", "accessories"],
  ["Minisplit Hisense AT121CBW inverter 110V solo frio AIRHSE220", "HISENSE", "climatizacion/aires-acondicionados/minisplit/inverter/12000-btu/110v-solo-frio/hisense-at121cbw", "accessories"],
  ["Minisplit Hisense AU122CBW inverter 220V frio calor AIRHSE250", "HISENSE", "climatizacion/aires-acondicionados/minisplit/inverter/12000-btu/220v-frio-calor/hisense-au122cbw", "accessories"],
  ["Carpeta Wilson Jones P4558-P4557 ACCO Press carta verde claro ACCACO050", "Wilson Jones", "oficina/papeleria/archivo/folders/carta/verde-claro/10-piezas/wilson-jones-acco-p4558", "accessories"],
  ["Candado Kensington K60501M Slim N17 keyed wedge lock ACCKNS2060", "KENSINGTON", "accesorios/seguridad-fisica/candados-laptop/llave/n17-slim/kensington-k60501m", "accessories"],
  ["Diadema Logitech H390 USB rosa 981-001280 BOCLOG2030", "LOGITECH", "audio/audifonos/diadema/oficina-usb/logitech-h390-rose-981-001280", "headphones"],
  ["Modulo tactil BenQ PointWrite PT20 para proyector interactivo ACCBNQ620", "BENQ", "electronica/pantallas-y-monitores/pizarrones-interactivos/accesorios-touch/benq-pointwrite-pt20", "accessories"],
  ["Gis de colores BACO GS006 caja con 50 piezas ACCBAC4070", "BACO", "oficina/papeleria/material-escolar/pizarron/gises-color/baco-gs006-50p", "accessories"],
  ["Perforadora metalica Pegaso 300 triple 3 orificios ACCAZR870", "PEGASO", "oficina/equipo-oficina/perforadoras/3-orificios/pegaso-300", "accessories"],
  ["Silicon en barra MAE SBP-7ML 7 mm 1 kg ACCMAE1030", "MAE", "oficina/papeleria/adhesivos/silicon-termofusible/barras-delgadas/mae-sbp-7ml-1kg", "accessories"],
] as const;

describe("manual taxonomy batches 246 plus", () => {
  it.each(batch246Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "gaming" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
