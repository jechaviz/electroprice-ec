import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch245Cases = [
  ["Plastilina BACO PL013 marqueta 180 g negra No 61 ACCBAC3680", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/negro/baco-pl013", "accessories"],
  ["Plastilina BACO PL015 marqueta 180 g violeta No 63 ACCBAC4000", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/violeta/baco-pl015", "accessories"],
  ["Plastilina BACO PL045 marqueta 180 g azul cielo ACCBAC3700", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/azul-cielo/baco-pl045", "accessories"],
  ["Plastilina BACO PL091 marqueta 180 g gris obscuro No 74 ACCBAC3710", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/gris-oscuro/baco-pl091", "accessories"],
  ["Manhattan 439947 Cambridge maletin laptop 15.6 pulgadas AC-10897", "MANHATTAN", "computo/accesorios/mochilas-fundas/maletines-laptop/15-6/manhattan-cambridge-439947", "accessories"],
  ["Paperline 48991389136438 papel bond carta 70g 95 blancura 5000 hojas", "Paperline", "oficina/papel-consumibles/papel-bond/carta/5000-hojas/paperline-70g-95-blancura", "accessories"],
  ["Canon imageRUNNER ADVANCE DX 617iF multifuncional laser COPCNN440", "CANON", "impresion/impresoras/multifuncionales-laser/monocromaticas/canon-imagerunner-advance-dx-617if", "printers_scanners"],
  ["Stylos STASWM3A smartwatch SW2 Bluetooth 4.0 azul ACCSTY350", "STYLOS", "electronica/wearables/smartwatches/stylos-staswm3a", "accessories"],
  ["Epson C13S210057 tanque de mantenimiento SureColor CN-4111", "EPSON", "impresion/consumibles/cajas-mantenimiento/epson-surecolor/c13s210057", "printers_scanners"],
  ["Amazfit T-Rex 2 A2170 outdoor GPS smartwatch ACCAMZ120", "AMAZFIT", "electronica/wearables/smartwatches/outdoor-gps/amazfit-t-rex-2", "accessories"],
] as const;

describe("manual taxonomy batches 245 plus", () => {
  it.each(batch245Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
