import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch227Cases = [
  ["Canon imageFORMULA DR-G2110 escaner produccion ADF A3 110 ppm SCACNN530", "CANON", "impresion/escaneres/documentales/produccion/adf/a3/canon-imageformula-dr-g2110", "printers_scanners"],
  ["Ovaltech OVREP-291 repisa flotante vidrio templado 36 cm ACCOVL780", "OVALTECH", "accesorios/montaje-soportes/audio-video/repisas-pared/vidrio/ovaltech-ovrep-291", "accessories"],
  ["Fujitsu fi-7480 escaner ADF duplex A3 CCD 60 ppm SCAFJT130", "FUJITSU", "impresion/escaneres/documentales/adf/duplex/a3/fujitsu-fi-7480", "printers_scanners"],
  ["Kodak Alaris E1025 escaner documental ADF duplex 25 ppm SCAKDK730", "KODAK", "impresion/escaneres/documentales/adf/duplex/kodak-e1025", "printers_scanners"],
  ["Multimedia Screens JC-P835SD mini kiosco JC Vision ACCMTD460", "Multimedia Screens", "punto-de-venta/kioscos/pantallas-interactivas/mini-kioscos/multimedia-screens-jc-p835sd", "accessories"],
  ["Multimedia Screens ESHOW sistema presentacion interactivo inalambrico ACCMTD470", "Multimedia Screens", "computo/colaboracion/presentacion-inalambrica/multimedia-screens-eshow", "desktops"],
  ["Getttech GCS-69201 Apollo cargador inalambrico Qi ACCGET100", "GETTTECH", "energia/cargadores-inalambricos/qi/getttech-gcs-69201", "power"],
  ["Enson ENS-DC15 distribuidor pulpo 1 a 5 canales CCTV ACCMVA1160", "ENSON", "seguridad/cctv/accesorios-alimentacion/distribuidores-dc/1-a-5/enson-ens-dc15", "cameras"],
  ["Enson ENS-FP61 placa de pared universal 1 puerto sin jack ACCMVA950", "ENSON", "redes/cableado-estructurado/placas-keystone/1-puerto/enson-ens-fp61", "networking"],
  ["Enson ENS-DC16 distribuidor pulpo 1 a 6 canales CCTV ACCMVA1170", "ENSON", "seguridad/cctv/accesorios-alimentacion/distribuidores-dc/1-a-6/enson-ens-dc16", "cameras"],
] as const;

describe("manual taxonomy batches 227 plus", () => {
  it.each(batch227Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
