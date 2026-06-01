import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch241Cases = [
  ["Barra JANEL Silicon Delgado 7.4 x 20 cms c/1 kilo BAS7420101 ACCJAN040", "JANEL", "oficina/papeleria/adhesivos/silicon-termofusible/barras-delgadas/janel-bas7420101-1kg", "accessories"],
  ["Razer Kishi Android RZ06-02900100/RF gamepad movil USB-C negro CONRAZ010", "RAZER", "gaming/accesorios/controles-gamepad/mobile-usb-c/android/razer-kishi-rz06-02900100-rf", "gaming"],
  ["PCM 50000I0010A etiquetas TT blanco ACCPCM1330", "PCM", "impresion/consumibles/etiquetas/transferencia-termica/blancas/pcm-50000i0010a", "printers_scanners"],
  ["PCM 50000I0008B etiquetas TT blanco ACCPCM1340", "PCM", "impresion/consumibles/etiquetas/transferencia-termica/blancas/pcm-50000i0008b", "printers_scanners"],
  ["PCM 50000I0011A etiquetas TT blanco ACCPCM1350", "PCM", "impresion/consumibles/etiquetas/transferencia-termica/blancas/pcm-50000i0011a", "printers_scanners"],
  ["PCM 50000I0013A etiquetas TT blanco ACCPCM1360", "PCM", "impresion/consumibles/etiquetas/transferencia-termica/blancas/pcm-50000i0013a", "printers_scanners"],
  ["PCM 50000I0016A etiquetas TT blanco ACCPCM1400", "PCM", "impresion/consumibles/etiquetas/transferencia-termica/blancas/pcm-50000i0016a", "printers_scanners"],
  ["PCM 50000I0020A etiquetas TT blanco ACCPCM1410", "PCM", "impresion/consumibles/etiquetas/transferencia-termica/blancas/pcm-50000i0020a", "printers_scanners"],
  ["Tripp Lite PDUV30HV PDU basico 0U 30A 208V C13 C19 L6-30P PDUTRL060", "TRIPP LITE", "energia/pdu-rack/basicos/0u-30a-208v-c13-c19/tripp-lite-pduv30hv", "power"],
  ["Multimedia Screens MSE-229 MSEV-150 pantalla electrica 150 pulgadas PANSCR270 AC-5540", "MULTIMEDIA SCREENS", "video/accesorios-proyeccion/pantallas-electricas/150-pulgadas/multimedia-screens-mse-229", "monitors"],
] as const;

describe("manual taxonomy batches 241 plus", () => {
  it.each(batch241Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
