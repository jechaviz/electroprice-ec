import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch237Cases = [
  ["Foliador metalico automatico 6 digitos GENERICO KWP010 ACCKWP010", "GENERICO", "oficina/equipo-oficina/foliadores/automaticos-6-digitos/generico-kwp010", "accessories"],
  ["Microfono gamer Xzeal XZST250B USB tripode filtro anti-pop ACCSTY320", "XZEAL", "audio/microfonos/escritorio-usb/xzeal-xzst250b", "audio"],
  ["Elgato Ring Light 10LAC9901 aro de luz LED Wi-Fi 43.2 cm ACCCOR310", "ELGATO", "video/accesorios-foto-video/iluminacion/aros-luz/elgato-ring-light-10lac9901", "accessories"],
  ["Servidor virtual en la nube CT Cloud NCSVDUOCQ paquete CQ DUO SERCLO310", "CT CLOUD", "software/servicios-nube/ct-cloud/servidores-virtuales/cq-duo-ncsvduocq", "software"],
  ["Servicio en la Nube CT Cloud NCSVPLUSCQ paquete Plus CQ SERCLO320", "CT CLOUD", "software/servicios-nube/ct-cloud/gestion-nube/plus-cq-ncsvpluscq", "software"],
  ["Escaner EPSON DS-30000 B11B256201 A3 ADF duplex 70ppm SCAEPS730", "EPSON", "impresion/escaneres/documentales/adf/duplex/a3/epson-ds-30000-b11b256201", "printers_scanners"],
  ["Plastilina BACO 65018 colores primarios barras 10 piezas ACCBAC3610", "BACO", "oficina/papeleria/material-escolar/plastilina/barras-10p/baco-65018", "accessories"],
  ["Clip cuadradito BACO 12067 No. 1 niquelado caja 100 piezas ACCBAC3620", "BACO", "oficina/papeleria/sujetadores/clips/cuadraditos/no-1/baco-12067-100-piezas", "accessories"],
  ["Clip cuadradito BACO 12043 No. 2 niquelado caja 100 piezas ACCBAC3630", "BACO", "oficina/papeleria/sujetadores/clips/cuadraditos/no-2/baco-12043-100-piezas", "accessories"],
  ["Candado Kensington K65048WW MicroSaver 2.0 Twin con llave doble ACCKNS1210", "KENSINGTON", "accesorios/seguridad-fisica/candados-laptop/llave/microsaver-2-0/kensington-k65048ww-twin", "accessories"],
] as const;

describe("manual taxonomy batches 237 plus", () => {
  it.each(batch237Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
