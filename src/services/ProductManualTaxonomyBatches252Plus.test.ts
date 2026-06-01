import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch252Cases = [
  ["Cabezal HP 739 DesignJet 498N0A CARHPD5070", "HP", "impresion/refacciones/cabezales/inkjet/hp-designjet-739/498n0a", "printers_scanners"],
  ["Soft Restaurant SR-11LITE-RA renta anual 2 nodos KITNTS4190", "Soft Restaurant", "punto-de-venta/software-pos/restaurantes/licencias-renta-anual/soft-restaurant-11-lite-2-nodos", "software"],
  ["Soft Restaurant SR-11PRO-RE renta mensual professional 10 nodos KITNTS4200", "Soft Restaurant", "punto-de-venta/software-pos/restaurantes/licencias-renta-mensual/soft-restaurant-11-pro-10-nodos", "software"],
  ["Soft Restaurant Analytic SR-ANALYTICS-RA renta anual KITNTS4300", "Soft Restaurant", "punto-de-venta/software-pos/restaurantes/analytics/renta-anual/soft-restaurant-analytics-ra", "software"],
  ["Lector Datalogic QuickScan QD2220-BKK1S 1D USB LCTPSC1050", "DATALOGIC", "punto-de-venta/lectores-codigo-barras/1d-cableados/quickscan-2200/datalogic-qd2220-bkk1s", "accessories"],
  ["Barra de sonido Hisense AX3120G 3.1.2 Dolby Atmos AUDHSE040", "HISENSE", "audio/barras-sonido/tv/dolby-atmos/hisense-ax3120g", "audio"],
  ["Mochila preescolar Perfect Choice Dreamer Tigre PC-084402 MALGEN4290", "PERFECT CHOICE", "oficina/papeleria/material-escolar/mochilas/preescolar/perfect-choice-dreamer-tigre-pc-084402", "accessories"],
  ["Lector Datalogic QuickScan QBT2500-BK-BTK1 Bluetooth 2D LCTPSC1070", "DATALOGIC", "punto-de-venta/lectores-codigo-barras/2d-inalambricos/quickscan-2500-bluetooth/datalogic-qbt2500-bk-btk1", "accessories"],
  ["Lector Datalogic QuickScan QW2520-BKK11S 2D USB cable espiral LCTPSC940", "DATALOGIC", "punto-de-venta/lectores-codigo-barras/2d-cableados/quickscan-2500/datalogic-qw2520-bkk11s-espiral-soporte", "accessories"],
  ["Lector industrial Datalogic PowerScan PD9630-ARK2 Auto Range RS-232 LCTPSC1090", "DATALOGIC", "punto-de-venta/lectores-codigo-barras/2d-cableados/industriales-powerscan-9600/rs232-auto-range/datalogic-pd9630-ark2", "accessories"],
] as const;

describe("manual taxonomy batches 252 plus", () => {
  it.each(batch252Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
