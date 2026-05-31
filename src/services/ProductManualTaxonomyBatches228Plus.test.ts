import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch228Cases = [
  ["Enson ENS-DC18 distribuidor pulpo 1 a 8 canales CCTV ACCMVA1180", "ENSON", "seguridad/cctv/accesorios-alimentacion/distribuidores-dc/1-a-8/enson-ens-dc18", "cameras"],
  ["Canon imageFORMULA DR-M260 escaner documental ADF duplex 60 ppm SCACNN540", "CANON", "impresion/escaneres/documentales/adf/duplex/a4-legal/canon-imageformula-dr-m260", "printers_scanners"],
  ["Manhattan London 439909 maletin para laptop 17.3 pulgadas MALITL720", "MANHATTAN", "computo/accesorios/mochilas-fundas/maletines-laptop/17-3/manhattan-london-439909", "accessories"],
  ["Zebra P1080383-442 kit upgrade Ethernet module ZD410 ZD420 ACCZBR2310", "ZEBRA", "impresion/impresoras-etiquetas/accesorios/modulos-conectividad/ethernet/zebra-p1080383-442", "printers_scanners"],
  ["Vorago CLN-301 spray desinfectante superficies equipos ACCVGO2080", "VORAGO", "computo/accesorios/limpieza/desinfectantes-superficies/vorago-cln-301", "accessories"],
  ["HP ScanJet Enterprise Flow 5000 s5 6FW09A escaner documental SCAHPI475", "HP", "impresion/escaneres/documentales/adf/duplex/a4-legal/hp-scanjet-enterprise-flow-5000-s5", "printers_scanners"],
  ["EPCOM PLK12DC4ABK fuente CCTV 4 canales 12V con respaldo ACCEPC360", "EPCOM", "seguridad/cctv/fuentes-poder/respaldo-bateria/4-canales/epcom-plk12dc4abk", "cameras"],
  ["Naceb Gaming Black Mamba NA-0317 audifono gamer alambrico BOCNCB760", "Naceb Gaming", "audio/audifonos/gaming-alambricos/3-5mm-usb-rgb/naceb-black-mamba-na-0317", "headphones"],
  ["Kensington K65020WW MicroSaver 2.0 candado de llave laptop ACCKNS610", "KENSINGTON", "accesorios/seguridad-fisica/candados-laptop/llave/microsaver-2-0/kensington-k65020ww", "accessories"],
  ["Kensington P7515 K56152 descansa pies ajustable antideslizante ACCKNS770", "KENSINGTON", "oficina/ergonomia/reposapies/ajustables/kensington-p7515-k56152", "accessories"],
] as const;

describe("manual taxonomy batches 228 plus", () => {
  it.each(batch228Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
