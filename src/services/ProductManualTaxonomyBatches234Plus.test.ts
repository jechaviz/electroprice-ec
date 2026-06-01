import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch234Cases = [
  ["Marcador Permanente AZOR SIGNAL 30653 estuche 5 piezas negro rojo azul verde violeta ACCAZR440", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fino/surtidos/5-piezas/azor-signal-30653", "accessories"],
  ["Boligrafo AZOR PINPOINT 6830NE negro paquete 12 piezas punta mediana 1.00 mm ACCAZR460", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punto-mediano/azor-pinpoint-cuerpo-transparente/negro/12-piezas/azor-pinpoint-6830ne", "accessories"],
  ["Marcador permanente AZOR SIGNAL 30007 cafe punto fino paquete 12 piezas ACCAZR470", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fino/cafe/12-piezas/azor-signal-30007", "accessories"],
  ["Marcador AZOR AQUARELO 29412 DUO estuche paquete con 12 piezas ACCAZR530", "AZOR", "oficina/papeleria/marcadores/base-agua-lavables/doble-punta/12-colores/azor-aquarelo-duo-29412", "accessories"],
  ["Marcador AZOR SIGNAL 40003 XTRA azul punta cincel 6mm 300 mts ACCAZR540", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-xtra/azul/12-piezas/azor-signal-xtra-40003", "accessories"],
  ["Marcador AZOR 40004 XTRA rojo punta gruesa cincel 6mm EAN 7501428701010 ACCAZR560", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-xtra/rojo/12-piezas/azor-signal-xtra-40002", "accessories"],
  ["Marcador Permanente AZOR SIGNAL 30005 amarillo punto fino paquete con 12 piezas ACCAZR580", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fino/amarillo/12-piezas/azor-signal-30005", "accessories"],
  ["Marcador Permanente AZOR SIGNAL 30008 violeta punto fino paquete con 12 piezas ACCAZR590", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fino/violeta/12-piezas/azor-signal-30008", "accessories"],
  ["Boligrafo AZOR UNI-BALL DELUXE ROLLER UB155AZ1 azul blister con 1 pieza ACCAZR630", "AZOR", "oficina/papeleria/boligrafos/roller/uni-ball-deluxe/azul/blister-1-pieza/azor-ub155az1", "accessories"],
  ["Broche BACO B-072 14979 ancho de 7 cm caja con 50 broches ACCBAC020", "BACO", "oficina/papeleria/sujetadores/broches-archivo/7cm/baco-b072-50-piezas", "accessories"],
] as const;

describe("manual taxonomy batches 234 plus", () => {
  it.each(batch234Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
