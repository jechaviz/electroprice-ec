import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch249Cases = [
  ["Dell N_INSPNBL5_C1_R3 POL-9452 Premium Support Inspiron 7430 2-in-1", "DELL", "servicios-ti/soporte-garantias/dell/premium-support/inspiron-notebooks/inspiron-7430-7440-2in1/1y-carry-in-a-3y-premium-support", "software"],
  ["Caja de conexiones Provision-ISR PR-JB12IP64 ACCPVS740 UPC 619317410701", "PROVISION-ISR", "seguridad/cctv/accesorios-camaras/cajas-conexion/impermeables-ip64/provision-pr-jb12ip64", "security"],
  ["Maletin portafolio Manhattan Helsinki 440363 14.1 pulgadas AC-10898", "MANHATTAN", "computo/accesorios/mochilas-fundas/maletines-laptop/14-1/manhattan-helsinki-440363", "accessories"],
  ["Microsoft CSP Access LTSC 2024 EDU DG7GMGF0PN5J:0002:EDUCATION SWS-6371", "MICROSOFT", "software/licencias/microsoft/access/ltsc-2024/education-perpetual", "software"],
  ["Synology DiskStation DS923+ NAS 4 bahias SERTRD1260 UPC 846504004454", "SYNOLOGY", "computo/almacenamiento/nas/4-bahias/synology-ds923-plus", "storage"],
  ["Soporte Peerless-AV SmartMount Supreme DS-VW775-QR videowall AC-6940", "PEERLESS", "accesorios/montaje-soportes/audio-video/videowall/pared/liberacion-rapida/peerless-ds-vw775-qr", "accessories"],
  ["HP SJ PRO 4200 ScanJet Pro 4200 s1 ADF duplex SCAHPI560", "HP", "impresion/escaneres/documentales/adf/duplex/a4-legal/hp-scanjet-pro-4200-s1", "printers_scanners"],
  ["Microsoft Office LTSC Professional Plus 2024 Commercial DG7GMGF0PN5F:0002:Commercial SWS-5775", "MICROSOFT", "software/licencias/microsoft/office-ltsc/professional-plus-2024/commercial-perpetual", "software"],
  ["Eaton Tripp Lite EnviroSense2 E2SLD sensor detector de fugas ACCTRL5550", "TRIPP LITE", "energia/accesorios-ups/sensores-ambientales/fuga-agua/eaton-tripp-lite-e2sld", "power"],
  ["Dell N_DOL2_N3_P3 POL-10375 ProSupport Dell Pro 14 16 3 anos Basic NBD", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/dell-pro-laptops/3y-basic-nbd-a-3y-prosupport", "software"],
] as const;

describe("manual taxonomy batches 249 plus", () => {
  it.each(batch249Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
