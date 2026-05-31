import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch233Cases = [
  ["Tabla agarrapapeles BACO 14016 tamano carta fibracel ACCBAC1790", "BACO", "oficina/papeleria/organizacion-archivo/tablas-agarrapapeles/carta/baco-14016", "accessories"],
  ["Tabla agarrapapeles BACO 14023 tamano oficio fibracel ACCBAC1800", "BACO", "oficina/papeleria/organizacion-archivo/tablas-agarrapapeles/oficio/baco-14023", "accessories"],
  ["Marcador para pizarron BACO TizaPen 50519 colores surtidos 4 piezas ACCBAC2330", "BACO", "oficina/papeleria/marcadores/pizarron-blanco/baco-tizapen/4-piezas/baco-50519", "accessories"],
  ["Resaltador BACO Bacoflash 99358 verde caja con 12 piezas ACCBAC2410", "BACO", "oficina/papeleria/marcadores/resaltadores/verde/12-piezas/baco-bacoflash-99358", "accessories"],
  ["Marcador base agua BACO Bacolor 50328 surtido 12 piezas ACCBAC2450", "BACO", "oficina/papeleria/marcadores/base-agua-lavables/12-colores/baco-bacolor-50328", "accessories"],
  ["Crayones BACO Jumbo 65490 colores surtidos 24 piezas ACCBAC2800", "BACO", "oficina/papeleria/material-escolar/dibujo-arte/crayones/baco-jumbo-65490-24p", "accessories"],
  ["Lapiz de grafito BACO Bacopencil 53312 HB No 2 caja 10 piezas ACCBAC2920", "BACO", "oficina/papeleria/material-escolar/escritura/lapices-grafito/baco-bacopencil-53312-10p", "accessories"],
  ["Boligrafo BACO Le Plume 53428 azul punto mediano caja 12 piezas ACCBAC3100", "BACO", "oficina/papeleria/boligrafos/boligrafo-punto-mediano/baco-le-plume-azul-12-piezas", "accessories"],
  ["Cutter BACO CUT-202 00880 largo 13 cm bolsa 25 piezas ACCBAC3360", "BACO", "oficina/papeleria/herramientas-corte/cutters/baco-cut-202-00880-25p", "accessories"],
  ["Marcador AZOR Magistral Didactico 8354 estuche 4 piezas ACCAZR430", "AZOR", "oficina/papeleria/marcadores/pizarron-blanco/magistral-didactico/surtidos/4-piezas/azor-8354", "accessories"],
] as const;

describe("manual taxonomy batches 233 plus", () => {
  it.each(batch233Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
