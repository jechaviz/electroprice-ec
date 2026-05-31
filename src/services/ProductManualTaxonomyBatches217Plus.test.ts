import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch217Cases = [
  ["Huawei Watch D2 55020FKG-DSR azul smartwatch salud presion arterial ECG", "HUAWEI", "electronica/wearables/smartwatches/salud-presion-arterial/huawei-watch-d2-55020fkg-dsr", "accessories"],
  ["Canon kit BH-10 GI-11 PGBK cabezal negro tinta PIXMA MegaTank CARCNN6730", "CANON", "impresion/consumibles/cabezales/canon-pixma-megatank/canon-bh-10-gi-11-pgbk", "printers_scanners"],
  ["Teltonika TAT100 rastreador GPS GNSS de activos 2G IP68 negro", "TELTONIKA", "electronica/rastreo-gps-telematica/rastreadores-activos/teltonika-tat100", "security"],
  ["BACO Bacoiris LP003 52544 lapices de colores redondos estuche 24 piezas", "BACO", "oficina/papeleria/material-escolar/dibujo-arte/lapices-color/baco-bacoiris-lp003-24p", "accessories"],
  ["Kangji KY-111 termometro infrarrojo frontal sin contacto memoria 32 lecturas", "KANGJI", "salud/equipo-medico/monitoreo/termometros-infrarrojos/kangji-ky-111", "accessories"],
  ["Synology DiskStation DS423+ servidor NAS 4 bahias Intel Celeron J4125", "SYNOLOGY", "computo/almacenamiento/nas/4-bahias/synology-ds423-plus", "storage"],
  ["Dell N_DOL2_N1_P3 Pro laptops 1Y Next Business Day a 3Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/dell-pro-laptops/1y-nbd-a-3y-prosupport", "software"],
  ["Autodesk AutoCAD C1RK1-WW3611-L802 specialized toolsets ELD 3 Year Subscription", "AUTODESK", "software/cad-diseno/autodesk-autocad/toolsets-3y-1usuario-eld", "software"],
  ["Janel Memo Tip 6590303197 notas adhesivas neon 3x3 400 hojas", "JANEL", "oficina/papeleria/notas-adhesivas/3x3/neon/janel-memo-tip-6590303197-400h", "accessories"],
  ["DIEM FP10005 folder rosa pastel tamano carta paquete 100 piezas", "DIEM", "oficina/papeleria/archivo/folders/carta/pastel/rosa/diem-fp10005-100p", "accessories"],
] as const;

describe("manual taxonomy batches 217 plus", () => {
  it.each(batch217Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
