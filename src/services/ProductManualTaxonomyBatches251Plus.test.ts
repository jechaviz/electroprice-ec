import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch251Cases = [
  ["Smartwatch Hyundai HTSW001BK HY Smart Watch SW001 ACCHYU020 negro", "HYUNDAI", "electronica/wearables/smartwatches/deportivos/hyundai-hy-smart-watch-sw001-htsw001bk", "accessories"],
  ["Radio Cambium Networks PTP-670CE backhaul conectorizado ACCCAM040 4.9 6.05 GHz", "CAMBIUM NETWORKS", "redes/radioenlaces-antenas/radios-backhaul/ptp-hcmp/sub-6ghz/cambium-ptp-670ce", "networking"],
  ["Papel Vangogh 17502250376216 carta 75g 95 blancura ACCCMX010", "VANGOGH", "oficina/papel-consumibles/papel-bond/carta/5000-hojas/vangogh-75g-95", "accessories"],
  ["Terminal Hisense HK578U TERHSE110 punto de venta 15 pulgadas J6412", "HISENSE", "punto-de-venta/terminales-pos/all-in-one/15-pulgadas/histone-hisense-hk578u-j6412", "accessories"],
  ["Terminal Hisense HK578U i5 TERHSE120 punto de venta 15 pulgadas", "HISENSE", "punto-de-venta/terminales-pos/all-in-one/15-pulgadas/histone-hisense-hk578u-i5", "accessories"],
  ["Roku Express 3960RW Full HD streaming ACCROK210", "ROKU", "video/streaming/reproductores/full-hd/roku-express-3960rw", "tvs"],
  ["Papel Vision Bond 17502237370395 oficio 75g 97 blancura ACCCOP020", "VISION", "oficina/papel-consumibles/papel-bond/oficio/5000-hojas/vision-bond-75g-97", "accessories"],
  ["Lampara Epson ELPLP89 V13H010L89 LMPEPS490 para proyector", "EPSON", "audio-video/proyectores/accesorios/lamparas/epson-elplp89-v13h010l89", "accessories"],
  ["Pantalla DTEN D7X 55 Android DBR1455E PANDTE060 interactiva", "DTEN", "electronica/pantallas-y-monitores/pizarrones-interactivos/pantallas-colaboracion/55-pulgadas/dten-d7x-55-android-dbr1455e", "accessories"],
  ["Lector Datalogic QuickScan QD2590-BKK1S 2D USB LCTPSC1030", "DATALOGIC", "punto-de-venta/lectores-codigo-barras/2d-cableados/quickscan-2500/datalogic-qd2590-bkk1s", "accessories"],
] as const;

describe("manual taxonomy batches 251 plus", () => {
  it.each(batch251Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
