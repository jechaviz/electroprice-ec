import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch257Cases = [
  ["Vorago SC-500 scooter electrico 500W 48V amarillo", "VORAGO", "energia/movilidad-electrica/scooters-electricos/500w-48v/vorago-sc-500", "power"],
  ["Tripp Lite SRLADDERATTACH SmartRack cable ladder attachment kit", "TRIPP-LITE", "redes/racks/accesorios/escaleras-cableado/tripp-lite-srladderattach", "networking"],
  ["Zebra 800086-075 laminado holografico Safe Globe para ZXP Series 7", "ZEBRA", "punto-de-venta/credenciales-identificacion/consumibles/laminados-holograficos/zebra-zxp7/zebra-800086-075", "accessories"],
  ["Epson WorkForce ES-C320W B11B270201 scanner ADF duplex Wi-Fi", "EPSON", "impresion/escaneres/documentales/adf/duplex/a4-legal/wifi/epson-workforce-es-c320w", "printers_scanners"],
  ["Tripp Lite N238-001-WH jack keystone RJ45 Cat6 blanco", "TRIPP-LITE", "redes/cableado-estructurado/conectores-keystone/rj45-cat6/tripp-lite-n238-001-wh", "networking"],
  ["Epson WorkForce ES-C380W B11B269201 scanner ADF duplex Wi-Fi", "EPSON", "impresion/escaneres/documentales/adf/duplex/a4-legal/wifi/epson-workforce-es-c380w", "printers_scanners"],
  ["CyberPower PDU24002 ATS PDU 1U 20A 10 NEMA 5-20R", "CYBERPOWER", "energia/pdu-rack/ats/1u-20a-10-contactos/cyberpower-pdu24002", "power"],
  ["CyberPower CPS1220RMS rackbar surge protector 20A 12 NEMA 5-20R", "CYBERPOWER", "energia/pdu-rack/protectores-sobretension/1u-20a-12-contactos/cyberpower-cps1220rms", "power"],
  ["Hisense AP12CWN2 aire acondicionado portatil 12000 BTU 115V solo frio", "Hisense", "climatizacion/aires-acondicionados/portatiles/12000-btu/115v-solo-frio/hisense-ap12cwn2", "accessories"],
  ["Hisense HMMS2509BP microondas 0.9 pies cubicos 1000W negro", "Hisense", "hogar/electrodomesticos/microondas/0-9-pies/1000w/hisense-hmms2509bp", "accessories"],
] as const;

describe("manual taxonomy batches 257 plus", () => {
  it.each(batch257Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
