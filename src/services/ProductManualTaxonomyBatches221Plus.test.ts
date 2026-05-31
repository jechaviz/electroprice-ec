import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch221Cases = [
  ["Synology RackStation RS2825RP+ 16 bay NAS rack SERTRD1400", "SYNOLOGY", "computo/almacenamiento/nas/rack/16-bahias/synology-rs2825rp-plus", "storage"],
  ["Uni Paint PX20AM marcador permanente amarillo base aceite ACCAZR780", "UNI PAINT", "oficina/papeleria/marcadores/permanentes/industriales/base-aceite/uni-paint-px20-amarillo", "accessories"],
  ["Dell N_OPTL1_N1_M3 OptiPlex 3000 1Y Basic a 3Y ProSupport Plus POL-7726", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/desktops/optiplex-3000/1y-basic-a-3y-prosupport-plus/n-optl1-n1-m3", "software"],
  ["LG WP600-B webOS Box digital signage media player ACCLGE110", "LG", "video/senalizacion-digital/media-players/webos/lg-wp600-b", "monitors"],
  ["NASSA PC1006 folder canario oficio 100 piezas ACCMAP030", "NASSA", "oficina/papeleria/archivo/folders/oficio/canario/100-piezas/nassa-pc1006", "accessories"],
  ["Hillstone SGSV-A200-IN12U ServicePack A200 NGFW 12 meses FIRHST040", "HILLSTONE", "software/licencias/seguridad-red/hillstone/a200/servicepack-12m/sgsv-a200-in12u", "software"],
  ["Azor Vision Plus 2600AM resaltador amarillo caja 12 ACCAZR160", "AZOR", "oficina/papeleria/marcadores/resaltadores/amarillo/12-piezas/azor-vision-plus-2600am", "accessories"],
  ["Zebra SG-ET5X-SHDRSTP-01 breakaway shoulder strap ET5X ACCZBR3410", "ZEBRA", "punto-de-venta/terminales-moviles/accesorios/correas/zebra-et5x/sg-et5x-shdrstp-01", "accessories"],
  ["Qian QOC-143LK caja para dinero portatil con llave CJNQIA040", "QIAN", "punto-de-venta/cajones-dinero/cajas-portatiles/con-llave/qian-qoc-143lk", "accessories"],
  ["Canon imageFORMULA DR-C225 II escaner documental ADF duplex SCACNN500", "CANON", "impresion/escaneres/documentales/adf/duplex/a4/canon-imageformula-dr-c225-ii", "printers_scanners"],
] as const;

describe("manual taxonomy batches 221 plus", () => {
  it.each(batch221Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
