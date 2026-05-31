import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch225Cases = [
  ["Ubiquiti ISO-BEAM-620 radomo aislante airMAX ACCUBI290", "UBIQUITI", "redes/radioenlaces-antenas/accesorios/radomos-aislantes/ubiquiti-iso-beam-620", "networking"],
  ["Epson LabelWorks Strong Adhesive LK-6WBW cinta adhesivo fuerte CAREPS5640", "EPSON", "impresion/rotuladoras/consumibles/cintas/epson-labelworks/adhesivo-fuerte/lk-6wbw", "printers_scanners"],
  ["Kodak Alaris Scan Station 730EX scanner ADF 1730795 SCAKDK440", "KODAK", "impresion/escaneres/documentales/estaciones-red/adf/kodak-alaris-scan-station-730ex", "printers_scanners"],
  ["Zebra 10015784 Z-Perform 2000D 1.25 x 1 C/6 ACCETI730", "ZEBRA", "impresion/consumibles/etiquetas-papel/termicas-directas/zebra/z-perform-2000d/1-25x1-10015784", "printers_scanners"],
  ["Cisco Meraki LIC-MX64-SEC-5YR MX64 Advanced Security 5 anos LICCIS1640", "CISCO", "software/licencias/seguridad-red/cisco-meraki/mx64/advanced-security-5y", "software"],
  ["Cisco Meraki LIC-MX64W-ENT-1YR MX64W Enterprise 1 ano LICCIS1650", "CISCO", "software/licencias/seguridad-red/cisco-meraki/mx64w/enterprise-1y", "software"],
  ["Cisco Meraki LIC-MX64W-ENT-3YR MX64W Enterprise 3 anos LICCIS1660", "CISCO", "software/licencias/seguridad-red/cisco-meraki/mx64w/enterprise-3y", "software"],
  ["Cisco Meraki LIC-MX64W-ENT-5YR MX64W Enterprise 5 anos LICCIS1670", "CISCO", "software/licencias/seguridad-red/cisco-meraki/mx64w/enterprise-5y", "software"],
  ["Cisco Meraki LIC-MX64W-SEC-1YR MX64W Advanced Security 1 ano LICCIS1680", "CISCO", "software/licencias/seguridad-red/cisco-meraki/mx64w/advanced-security-1y", "software"],
  ["Cisco Meraki LIC-MX64W-SEC-3YR MX64W Advanced Security 3 anos LICCIS760", "CISCO", "software/licencias/seguridad-red/cisco-meraki/mx64w/advanced-security-3y", "software"],
] as const;

describe("manual taxonomy batches 225 plus", () => {
  it.each(batch225Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
