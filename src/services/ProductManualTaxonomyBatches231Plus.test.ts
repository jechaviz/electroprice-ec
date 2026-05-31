import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch231Cases = [
  ["Azor Signal Fino 30004 marcador permanente punto fino verde caja 12 ACCAZR210", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fino/verde/12-piezas/azor-signal-30004", "accessories"],
  ["Boligrafo Azor Pin Point cuerpo transparente 6830AZ azul 1.0 mm caja 12 ACCAZR220", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punto-mediano/azor-pinpoint-cuerpo-transparente/azul/12-piezas/azor-pinpoint-6830az", "accessories"],
  ["Pluma Azor Pin Point 6810NE negro punto fino 0.7 mm caja 12 ACCAZR230", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punta-fina/azor-pinpoint-6810ne-negro-12-piezas", "accessories"],
  ["Boligrafo Azor Pin Point cuerpo transparente 6830RO rojo 1.0 mm caja 12 ACCAZR260", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punto-mediano/azor-pinpoint-cuerpo-transparente/rojo/12-piezas/azor-pinpoint-6830ro", "accessories"],
  ["Marcador detector de billetes falsos Azor Signal Check-it 3200 ACCAZR270", "AZOR", "oficina/equipo-oficina/detectores-billetes/marcadores/azor-check-it-3200", "accessories"],
  ["Boligrafo Azor Pin Point Mandala 6810 colores surtidos punta fina 0.7 mm bolsa 10 ACCAZR290", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punta-fina/azor-pinpoint-mandala-6810-surtidos-10-piezas", "accessories"],
  ["Azor Signal Fino 30002 marcador permanente punto fino rojo caja 12 ACCAZR310", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fino/rojo/12-piezas/azor-signal-30002", "accessories"],
  ["Boligrafo Azor Pin Point cuerpo transparente 6830VE verde 1.0 mm caja 12 ACCAZR320", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punto-mediano/azor-pinpoint-cuerpo-transparente/verde/12-piezas/azor-pinpoint-6830ve", "accessories"],
  ["Pluma Azor Pin Point 6810AZ azul punto fino 0.7 mm caja 12 ACCAZR330", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punta-fina/azor-pinpoint-6810az-azul-12-piezas", "accessories"],
  ["Guillotina Pegaso Azor 21412 14 x 12.2 pulgadas A4 ACCAZR370", "AZOR", "oficina/equipo-oficina/guillotinas-cizallas/a4/pegaso-azor-21412", "accessories"],
] as const;

describe("manual taxonomy batches 231 plus", () => {
  it.each(batch231Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
