import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch224Cases = [
  ["Kodak Alaris S2070 scanner 1015049 70 ppm SCAKDK650", "KODAK", "impresion/escaneres/documentales/adf/duplex/a4-legal/kodak-alaris-s2070", "printers_scanners"],
  ["Kodak Alaris S2060w scanner 1015114 Wi-Fi Ethernet SCAKDK660", "KODAK", "impresion/escaneres/documentales/adf/duplex/a4-legal/red/kodak-alaris-s2060w", "printers_scanners"],
  ["Kodak Alaris S2080w scanner 1015189 red Wi-Fi Ethernet SCAKDK670", "KODAK", "impresion/escaneres/documentales/adf/duplex/a4-legal/red/kodak-alaris-s2080w", "printers_scanners"],
  ["HID DigitalPersona 5300 U.are.U 50019-001-102 lector huella SOFING1300", "HID", "seguridad/control-acceso/biometricos/lectores-huella-usb/hid-digitalpersona-5300", "security"],
  ["Zebra P1058930-012 cabezal termico 203 dpi ZT420 ZT421 ACCZBR1510", "ZEBRA", "impresion/refacciones/cabezales/termicos/zebra/zt420-zt421-203dpi/p1058930-012", "printers_scanners"],
  ["Zebra P1058930-009 cabezal termico 203 dpi ZT410 ZT411 ACCZBR1340", "ZEBRA", "impresion/refacciones/cabezales/termicos/zebra/zt410-zt411-203dpi/p1058930-009", "printers_scanners"],
  ["Zebra G105910-053 cabezal impresion 203 dpi TLP2844 GC420t ACCZBR840", "ZEBRA", "impresion/refacciones/cabezales/termicos/zebra/tlp2844-gc420t-203dpi/g105910-053", "printers_scanners"],
  ["Megapower MVP735 presentador visual camara 5MP HDMI VGA ACCMTD250", "MEGAPOWER", "audio-video/proyectores/accesorios/presentadores-visuales/megapower-mvp735", "accessories"],
  ["CDP UPO22-PDU PDU 6-10K unidad distribucion alimentacion ACCCDP240", "CDP", "energia/pdu-rack/ups/6kva-10kva/cdp-upo22-pdu-6-10k", "power"],
  ["DESS CERDESS-1 certificacion distribuidor punto de venta SOFDES140", "DESS", "servicios-ti/certificaciones-distribuidor/dess/punto-de-venta/cerdess-1", "software"],
] as const;

describe("manual taxonomy batches 224 plus", () => {
  it.each(batch224Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
