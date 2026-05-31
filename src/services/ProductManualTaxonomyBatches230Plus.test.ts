import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch230Cases = [
  ["Kensington K33959WW placa de montaje VESA para docking station ACCKNS1080", "KENSINGTON", "computo/accesorios/soportes-monitor/vesa/docking-stations/kensington-k33959ww", "accessories"],
  ["HP Samsung CLT-W506 SU437A unidad recolectora de toner residual TONHPS1360", "HP", "impresion/consumibles/contenedores-desperdicio/hp-samsung/clt-w506-su437a", "printers_scanners"],
  ["Marcador Magistral Azor 8350VE verde para pizarron blanco caja 12 ACCAZR020", "AZOR", "oficina/papeleria/marcadores/pizarron-blanco/magistral-didactico/verde/12-piezas/azor-8350ve", "accessories"],
  ["Marcadores base agua Azor Aquarelo Junior 2912 12 colores ACCAZR060", "AZOR", "oficina/papeleria/marcadores/base-agua-lavables/12-colores/azor-aquarelo-junior-2912", "accessories"],
  ["Marcador Magistral Azor 8350AZ azul para pizarron blanco caja 12 ACCAZR080", "AZOR", "oficina/papeleria/marcadores/pizarron-blanco/magistral-didactico/azul/12-piezas/azor-8350az", "accessories"],
  ["Marcador permanente Azor Signal 30001 punto fino negro caja 12 ACCAZR100", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fino/negro/12-piezas/azor-signal-30001", "accessories"],
  ["Boligrafo Azor Pin Point 6808 punto fino 0.7 mm con espirografo ACCAZR130", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punta-fina/azor-pinpoint-6808-surtidos-8-piezas", "accessories"],
  ["Marcador permanente Azor Signal 30003 punto fino azul caja 12 ACCAZR180", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fino/azul/12-piezas/azor-signal-30003", "accessories"],
  ["Boligrafo Azor Pin Point 6840NE ultrafino 0.5 mm negro caja 12 ACCAZR190", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punta-ultrafina/azor-pinpoint-6840ne-negro-12-piezas", "accessories"],
  ["Resaltador Azor Vision Plus 2600VE verde fluorescente punta cincel caja 12 ACCAZR200", "AZOR", "oficina/papeleria/marcadores/resaltadores/verde/12-piezas/azor-vision-plus-2600ve", "accessories"],
] as const;

describe("manual taxonomy batches 230 plus", () => {
  it.each(batch230Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
