import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch248Cases = [
  ["BenQ InstaShow VS20 sistema inalambrico de presentacion 4K ACCBNQ780", "BENQ", "computo/colaboracion/presentacion-inalambrica/videoconferencia/byod/benq-instashow-vs20", "accessories"],
  ["Tira LED inteligente WiFi RGBW Perfect Choice PC-108184 AC-9384", "PERFECT CHOICE", "domotica/iluminacion/tiras-led/wifi-rgbw/perfect-choice-pc-108184", "accessories"],
  ["Net2phone MX-CCE-CALL-QUEUE-SUPERVISOR licencia Call Queue Supervisor SWS-5746", "NET2PHONE", "software/comunicaciones-unificadas/telefonia-ip/ucaas/net2phone-unite/call-queue-supervisor-monthly", "software"],
  ["Tarjeta de proximidad Saxxon ASC-EM02 SAXM02U 125 kHz ACCSAX150", "SAXXON", "seguridad/control-acceso/credenciales-rfid/tarjetas-proximidad/125khz/saxxon-asc-em02", "security"],
  ["Recarga de revelador Sharp AL-100RD/U 190 g CN-1108", "SHARP", "impresion/consumibles/reveladores/sharp-al/recargas/al-100rd-u", "printers_scanners"],
  ["Robot aspirador TP-Link Tapo RV30 Max Plus 5300Pa SH-62", "TP LINK", "domotica/limpieza/robots-aspiradores/trapeadores/autovaciado/tp-link-tapo-rv30-max-plus", "accessories"],
  ["Lector Datalogic QuickScan QW2520-BKK1 USB 2D cable LCTPSC1020", "DATALOGIC", "punto-de-venta/lectores-codigos-barras/2d/usb/datalogic-qw2520-bkk1-cable", "accessories"],
  ["Lector Datalogic QuickScan QW2520-BKK1S USB 2D con soporte LCTPSC920", "DATALOGIC", "punto-de-venta/lectores-codigos-barras/2d/usb/datalogic-qw2520-bkk1s-soporte", "accessories"],
  ["Papel Vision Bond carta 75 g blancura 97 17502237370388 ACCCOP030", "VISION", "oficina/papel-consumibles/papel-bond/carta/5000-hojas/vision-bond-75g-97", "accessories"],
  ["Memoria SanDisk Extreme microSDXC 128GB SDSQXAA-128G-GN6MA UPC 619659188450", "SANDISK", "almacenamiento/memorias-flash/microsdxc/128gb/sandisk-extreme-sdsqxaa-128g-gn6ma", "storage"],
] as const;

describe("manual taxonomy batches 248 plus", () => {
  it.each(batch248Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
