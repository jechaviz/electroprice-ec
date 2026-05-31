import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch218Cases = [
  ["Perfect Choice PC-085041 Holdi bolsa cruzada crossbody negro MALGEN4670", "PERFECT CHOICE", "computo/accesorios/mochilas-fundas/bolsos-crossbody/compactos/perfect-choice-holdi-pc-085041", "accessories"],
  ["Canon PF-08 5706C003AA cabezal de impresion imagePROGRAF TC-20 CARCNN6950", "CANON", "impresion/refacciones/cabezales/inkjet/canon-imageprograf/pf-08-5706c003aa", "printers_scanners"],
  ["Grandstream GS-CONFIGREMOTA POL-10338 horas configuracion remota C1CB00001432", "GRANDSTREAM", "servicios-ti/configuracion-remota/telefonia-ip/grandstream/horas-gs-configremota", "software"],
  ["BACO MR167/61218 marcador permanente Tatoo morado punta fina caja 6 piezas", "BACO", "oficina/papeleria/marcadores/permanentes/tatoo/morado/6-piezas/baco-mr167-61218", "accessories"],
  ["TP-Link Tapo T315 sensor inteligente temperatura humedad pantalla E-Ink", "TP-LINK", "domotica/sensores/temperatura-humedad/tapo-t315", "accessories"],
  ["BACO GS022 72306 borrador base madera para pizarron ACCBAC3310", "BACO", "oficina/papeleria/pizarrones/accesorios/borradores/base-madera/baco-gs022", "accessories"],
  ["Azor 6840RO Pin Point ultrafino rojo 0.5mm caja 12 piezas", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punta-ultrafina/azor-pinpoint-6840ro-rojo-12-piezas", "accessories"],
  ["Lenovo 5WS0D80967 actualizacion garantia onsite ThinkCentre 3 anos POL-3703", "LENOVO", "servicios-ti/soporte-garantias/lenovo/onsite/thinkcentre/3y/5ws0d80967", "software"],
  ["Lenovo 5WS0T36189 5Y Premier Support NBD ThinkCentre AIO POL-10210", "LENOVO", "servicios-ti/soporte-garantias/lenovo/premier-support/thinkcentre-aio/5y-nbd/5ws0t36189", "software"],
  ["SONOFF CAM-PT2 camara IP WiFi interior 1080p pan tilt audio bidireccional", "SONOFF", "seguridad/cctv/camaras-ip-wifi/interior/1080p/pan-tilt/sonoff-cam-pt2", "cameras"],
] as const;

describe("manual taxonomy batches 218 plus", () => {
  it.each(batch218Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
