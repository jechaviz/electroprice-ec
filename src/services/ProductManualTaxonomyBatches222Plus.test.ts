import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch222Cases = [
  ["PCM 10B21 papel bond para plotter 0.61 x 150 m ACCPCM785", "PCM", "impresion/consumibles/papel-plotter/bond/rollos-61cm-150m/pcm-10b21", "printers_scanners"],
  ["CDP UPOSNMP-DP520 SNMP-DY520 tarjeta SNMP interna UPS ACCCDP210", "CDP", "energia/no-breaks-ups/accesorios/tarjetas-comunicacion/snmp/cdp-uposnmp-dp520", "power"],
  ["Canon imageFORMULA DR-C240 escaner documental ADF duplex SCACNN440", "CANON", "impresion/escaneres/documentales/adf/duplex/a4/canon-imageformula-dr-c240", "printers_scanners"],
  ["Laces LA300KIL kit de iluminacion rack 19 1U ACCLCS250", "LACES", "infraestructura/racks-accesorios/iluminacion/1u/laces-la300kil", "networking"],
  ["Honeywell Intermec 871-228-201 AD20 single dock CK3 ACCHHP930", "INTERMEC", "punto-de-venta/terminales-moviles/accesorios/cunas/honeywell-intermec/871-228-201", "accessories"],
  ["Tripp Lite CSC32AC carrito movil carga AC 32 dispositivos ACCTRL2790", "TRIPP-LITE", "energia/estaciones-carga-dispositivos/carritos-ac/32-dispositivos/tripp-lite-csc32ac", "power"],
  ["Tripp Lite WorkWise WWSSDC sit stand desk clamp workstation ACCTRL3300", "TRIPP-LITE", "computo/accesorios/ergonomia/estaciones-trabajo-ajustables/sit-stand/abrazadera/tripp-lite-wwssdc", "accessories"],
  ["Tripp Lite WorkWise WWSSDT sit stand desktop workstation ACCTRL3310", "TRIPP-LITE", "computo/accesorios/ergonomia/estaciones-trabajo-ajustables/sit-stand/sobremesa/tripp-lite-wwssdt", "accessories"],
  ["Canon imageFORMULA P-208 II escaner portatil duplex USB SCACNN430", "CANON", "impresion/escaneres/documentales/portatiles/adf/duplex/canon-imageformula-p-208ii", "printers_scanners"],
  ["Ubiquiti airFiber AF-5G-OMT-S45 kit conversion RocketDish ACCUBI200", "UBIQUITI", "redes/wisp/airfiber/accesorios/kits-conversion/af-5g-omt-s45", "networking"],
] as const;

describe("manual taxonomy batches 222 plus", () => {
  it.each(batch222Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
