import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch240Cases = [
  ["CDP ES-AVR-1012 SOL inversor cargador solar 700W 12V INVCDP020", "CDP", "energia/solar/inversores-ups/line-interactive/mppt-12v/cdp-es-avr-1012-sol", "power"],
  ["CDP ES-AVR-3048 SOL inversor cargador solar 3000VA 48V INVCDP040", "CDP", "energia/solar/inversores-ups/line-interactive/mppt-48v/cdp-es-avr-3048-sol", "power"],
  ["CDP ES-AVR-5048 SOL inversor cargador solar 5KVA 48V INVCDP050", "CDP", "energia/solar/inversores-ups/line-interactive/mppt-48v/cdp-es-avr-5048-sol", "power"],
  ["Sobre para CD MAPASA HA0126 blanco 50 piezas ACCMAP050", "MAPASA", "oficina/papeleria/sobres/medios-opticos/cd-dvd/mapasa-ha0126-50p", "accessories"],
  ["Papel Cortado EUROCOLORS EC0012 carta arcoiris vibrante 100 hojas ACCEUR010", "EUROCOLORS", "oficina/papeleria/papel-cartulina/papel-color/carta/eurocolors-ec0012-100h", "accessories"],
  ["Registrador Carta Lefort 1530 amarillo ACCLEF010", "LEFORT", "oficina/papeleria/archivo/registradores/carta/lefort-1530-amarillo", "accessories"],
  ["Registrador Carta Lefort 1230 rojo ACCLEF020", "LEFORT", "oficina/papeleria/archivo/registradores/carta/lefort-1230-rojo", "accessories"],
  ["Registrador Carta Lefort 1330 verde ACCLEF030", "LEFORT", "oficina/papeleria/archivo/registradores/carta/lefort-1330-verde", "accessories"],
  ["Cubierta MAE PENT-25 carta negro transporte 25 juegos ACCMAE1010", "MAE", "oficina/papeleria/encuadernacion/cubiertas/polipropileno/carta/mae-pent-25-negro", "accessories"],
  ["Sacapuntas de plastico MAE SSS-25 figuras surtidas 25 piezas ACCMAE190", "MAE", "oficina/papeleria/material-escolar/escritura/sacapuntas/plastico/mae-sss-25-25p", "accessories"],
] as const;

describe("manual taxonomy batches 240 plus", () => {
  it.each(batch240Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
