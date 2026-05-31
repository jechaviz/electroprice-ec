import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch226Cases = [
  ["Cisco Meraki LIC-MX64W-SEC-5YR MX64W Advanced Security 5 anos LICCIS1690", "CISCO", "software/licencias/seguridad-red/cisco-meraki/mx64w/advanced-security-5y", "software"],
  ["Ingressio IngSfwNubeMotum1yr servicio nube mensual 50 empleados SOFING1410", "INGRESSIO", "software/recursos-humanos/control-asistencia/ingressio-nube/motum-50-empleados-1y", "software"],
  ["Ingressio Basico servicio control asistencia SOFING1430", "INGRESSIO", "software/recursos-humanos/control-asistencia/ingressio-basico", "software"],
  ["Vorago MK-300 kit de movilidad cargador auto KITVGO130", "VORAGO", "energia/cargadores-vehiculares/usb/kit-movilidad/vorago-mk-300", "power"],
  ["TP-Link Tapo H200 smart hub microSD 64 dispositivos AC-12282", "TP LINK", "domotica/hubs/smart-home/tp-link-tapo-h200", "security"],
  ["Ubiquiti UCK-G2-PLUS UniFi Cloud Key Gen2 Plus ACCUBI380", "UBIQUITI", "redes/controladoras/unifi/cloud-key/gen2-plus/ubiquiti-uck-g2-plus", "networking"],
  ["Qian PB-67 sensor puerta ventana inalambrico ACCQIA130", "QIAN", "seguridad/alarmas/sensores/puerta-ventana/inalambricos/qian-pb-67", "security"],
  ["Kodak Alaris S2040 scanner ADF duplex 40 ppm SCAKDK690", "KODAK", "impresion/escaneres/documentales/adf/duplex/a4-legal/kodak-alaris-s2040", "printers_scanners"],
  ["Getttech QLL-001 candado laptop tipo Kensington ACCGET020", "GETTTECH", "computo/accesorios/seguridad/candados-laptop/kensington/getttech-qll-001", "accessories"],
  ["Canon imageFORMULA DR-G2140 escaner produccion ADF A3 SCACNN520", "CANON", "impresion/escaneres/documentales/produccion/adf/a3/canon-imageformula-dr-g2140", "printers_scanners"],
] as const;

describe("manual taxonomy batches 226 plus", () => {
  it.each(batch226Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
