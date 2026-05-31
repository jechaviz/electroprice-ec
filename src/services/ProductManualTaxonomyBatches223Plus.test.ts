import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch223Cases = [
  ["Plantronics Poly EncorePro HW510 783Q1AA Quick Disconnect ACCPTS930", "PLANTRONICS", "audio/audifonos/call-center/alambricas-qd/poly-encorepro-hw510", "headphones"],
  ["EPCOM EPIG-2K inversor solar grid tie interconexion 2 kW ACCEPC090", "EPCOM", "energia/solar/inversores/interconexion-red/monofasicos-2kw/epcom-epig-2k", "power"],
  ["EPCOM EIMS-250-2 montaje universal acero galvanizado panel solar ACCEPC130", "EPCOM", "energia/solar/montajes-paneles/universales-acero/epcom-eims-250-2", "power"],
  ["EPCOM EPL-AM01-1X4 kit montaje aluminio techo piso panel solar ACCEPC140", "EPCOM", "energia/solar/montajes-paneles/aluminio/1x4/epcom-epl-am01-1x4", "power"],
  ["EPCOM PL12K kit solar 12V cerca electrificada ACCEPC230", "EPCOM", "energia/solar/kits-aislados/cercas-electrificadas/12v/epcom-pl12k", "power"],
  ["HP Samsung CLT-W406 SU426A recolector toner residual TONHPS105", "HP", "impresion/consumibles/contenedores-desperdicio/hp-samsung/clt-w406-su426a", "printers_scanners"],
  ["Tripp Lite SRSHELF2PDP SmartRack entrepano fijo rack 2U ACCTRL3440", "TRIPP-LITE", "infraestructura/racks-accesorios/entrepanos-charolas/fijas/tripp-lite-srshelf2pdp", "networking"],
  ["HP Digital Sender Flow 8500 fn2 L2762A cama plana ADF SCAHPI490", "HP", "impresion/escaneres/documentales/cama-plana-adf/digital-sender/hp-digital-sender-flow-8500-fn2", "printers_scanners"],
  ["HP ScanJet Enterprise Flow N9120 fn2 L2763A A3 cama plana ADF SCAHPI500", "HP", "impresion/escaneres/documentales/cama-plana-adf/a3/hp-scanjet-enterprise-flow-n9120-fn2", "printers_scanners"],
  ["Kodak Alaris S2050 scanner 1014968 ADF duplex USB SCAKDK640", "KODAK", "impresion/escaneres/documentales/adf/duplex/a4-legal/kodak-alaris-s2050", "printers_scanners"],
] as const;

describe("manual taxonomy batches 223 plus", () => {
  it.each(batch223Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
