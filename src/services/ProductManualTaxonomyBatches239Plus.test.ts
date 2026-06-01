import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch239Cases = [
  ["Marcador Uni Paint PX20NE negro base aceite ACCAZR800", "UNI PAINT", "oficina/papeleria/marcadores/permanentes/industriales/base-aceite/uni-paint-px20-negro", "accessories"],
  ["Marcador Uni Paint PX20AZ azul base aceite ACCAZR810", "UNI PAINT", "oficina/papeleria/marcadores/permanentes/industriales/base-aceite/uni-paint-px20-azul", "accessories"],
  ["Termometro inteligente con dispensador de gel KSA K9 Pro TERKSA050", "KSA", "salud/equipo-medico/monitoreo/termometros-infrarrojos/dispensador-gel/ksa-k9-pro", "accessories"],
  ["Folder DIEM FPTO10005 oficio rosa 23.5 x 29.5 cm 100 hojas ACCDIE850", "DIEM", "oficina/papeleria/archivo/folders/oficio/pastel/rosa/diem-fpto10005-100p", "accessories"],
  ["Pantalla de proyeccion Multimedia Screens MSET106 106 pulgadas electrica PANMTD040", "MULTIMEDIA SCREENS", "video/accesorios-proyeccion/pantallas-electricas/tensionadas/106-pulgadas/multimedia-screens-mset106", "monitors"],
  ["Mesa Interactiva JC Vision JC-MT320PCAP 32 pulgadas Full HD MESMTD010", "JC VISION", "electronica/pantallas-y-monitores/pizarrones-interactivos/mesas-interactivas/32-pulgadas/jc-vision-jc-mt320pcap", "accessories"],
  ["Mesa Interactiva JC Vision JC-MT430PCAP 43 pulgadas Full HD MESMTD020", "JC VISION", "electronica/pantallas-y-monitores/pizarrones-interactivos/mesas-interactivas/43-pulgadas/jc-vision-jc-mt430pcap", "accessories"],
  ["Lapiz de grafito BACO 53329 Bacopencil No 2 HB amarillo caja 50 ACCBAC2930", "BACO", "oficina/papeleria/material-escolar/escritura/lapices-grafito/baco-bacopencil-53329-50p", "accessories"],
  ["Pantalla de proyeccion Multimedia Screens MSI120 inflable piso PANSCR300", "MULTIMEDIA SCREENS", "video/accesorios-proyeccion/pantallas-inflables/piso/multimedia-screens-msi120", "monitors"],
  ["SmartWatch BT 4.0 Stylos STASWM3B negro ACCSTY330", "STYLOS", "electronica/wearables/smartwatches/stylos-staswm3b", "accessories"],
] as const;

describe("manual taxonomy batches 239 plus", () => {
  it.each(batch239Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
