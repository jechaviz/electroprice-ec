import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch243Cases = [
  ["Corsair RM850x CP-9020200-NA 850W 80 Plus Gold modular GABCOR1530", "CORSAIR", "computo/componentes/fuentes-poder/atx-80-plus-gold/850w/modular/corsair-rm850x-cp-9020200-na", "components"],
  ["Kodak Alaris S3120 Max escaner duplex ADF A3 8009433 SCAKDK790", "KODAK ALARIS", "impresion/escaneres/documentales/produccion/adf/a3/kodak-alaris-s3120-max", "printers_scanners"],
  ["Kodak Alaris S3100f scanner duplex 100ppm cama plana 8001851 SCAKDK800", "KODAK ALARIS", "impresion/escaneres/documentales/produccion/adf/a3/kodak-alaris-s3100f", "printers_scanners"],
  ["BACO LP001/52537 colores largos surtidos ACCBAC2840", "BACO", "oficina/papeleria/material-escolar/dibujo-arte/lapices-color/baco/largos-12p/lp001-52537", "accessories"],
  ["BACO LP002/52520 colores cortos surtidos ACCBAC2850", "BACO", "oficina/papeleria/material-escolar/dibujo-arte/lapices-color/baco/cortos-12p/lp002-52520", "accessories"],
  ["Folder DIEM 750623155144 carta marfil 150g ACCDIE920", "DIEM", "oficina/papeleria/archivo/folders/carta/marfil/100-piezas/diem-750623155144", "accessories"],
  ["Folder DIEM 750623155149 oficio marfil 150g ACCDIE930", "DIEM", "oficina/papeleria/archivo/folders/oficio/marfil/100-piezas/diem-750623155149", "accessories"],
  ["Nexxt Kronos1200-AC AEIEL905U1 extensor rango WiFi AC1200 ACPNEX020", "NEXXT SOLUTIONS HOME", "redes/red-activa/extensores-red/wifi-ac1200/nexxt-kronos1200-aeiel905u1", "networking"],
  ["Teltonika TAT140 rastreador de activos 4G LTE GNSS RASTEL040", "TELTONIKA", "redes/iot-telemetria/rastreadores-gps/activos/teltonika-tat140", "networking"],
  ["Teltonika GH5200 Worker BadgePLUS rastreador personal GPS RASTEL020", "TELTONIKA", "electronica/localizadores-gps/rastreadores-personales/seguridad-laboral/teltonika-gh5200", "security"],
] as const;

describe("manual taxonomy batches 243 plus", () => {
  it.each(batch243Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
