import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch242Cases = [
  ["Redragon A130B-SP Scarab Black keycaps PBT negro 105 piezas TECRDG170", "REDRAGON", "computo/perifericos/teclados/keycaps/pbt/redragon-a130b-sp-scarab-black", "gaming"],
  ["CT Cloud NCBU10TB backup de 10TB en la nube VDICLO010", "CT CLOUD", "software/servicios-nube/ct-cloud/respaldo-nube/10tb/ct-cloud-ncbu10tb", "software"],
  ["CT Cloud NCBUPER backup personalizado con recursos y licencias VDICLO030", "CT CLOUD", "software/servicios-nube/ct-cloud/respaldo-nube/personalizado/ct-cloud-ncbuper", "software"],
  ["Caja de Archivo Plastico Carta GEO 026 41 x 31 x 26 ACCGEO050", "GEO", "oficina/papeleria/archivo/cajas-archivo/carta/plastico/geo-026", "accessories"],
  ["Folder DIEM Brights carta paquete 25 piezas ACCDIE890", "DIEM", "oficina/papeleria/archivo/folders/carta/brights/25-piezas/diem-brights", "accessories"],
  ["Mobifree MB-02007 manos libres Bluetooth blanco BOCGEN3540", "MOBIFREE", "telefonia/audio/manos-libres/bluetooth-monoaural/mobifree-mb-02007", "headphones"],
  ["HP ScanJet Enterprise Flow N6600 fnw1 20G08A escaner ADF cama plana SCAHPI530", "HP", "impresion/escaneres/documentales/cama-plana-adf/a4-legal/hp-scanjet-enterprise-flow-n6600-fnw1", "printers_scanners"],
  ["Tripode Yeyian Glitnir Master YSS-SWFL-01-BL ACCYEY240", "YEYIAN", "foto-video/accesorios/tripodes/compactos-smartphone/yeyian-yss-swfl-01-bl", "accessories"],
  ["Anviz AN-FACEDEEP3IRT FaceDeep 3 IRT terminal facial temperatura SOFAVZ590", "ANVIZ", "seguridad/control-acceso/asistencia/biometricos/facial-temperatura/anviz-facedeep3irt", "security"],
  ["Anviz AN-FACEDEEP5IRT FaceDeep 5 IRT terminal facial temperatura SOFAVZ600", "ANVIZ", "seguridad/control-acceso/asistencia/biometricos/facial-temperatura/anviz-facedeep5irt", "security"],
] as const;

describe("manual taxonomy batches 242 plus", () => {
  it.each(batch242Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
