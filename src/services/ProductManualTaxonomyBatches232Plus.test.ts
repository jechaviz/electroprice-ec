import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch232Cases = [
  ["Guillotina Pegaso Azor 21614 B4 16 x 14.5 pulgadas ACCAZR380", "AZOR", "oficina/equipo-oficina/guillotinas-cizallas/b4/pegaso-azor-21614", "accessories"],
  ["Cabezal de impresion HP 713 DesignJet 3ED58A CARHPD4980", "HP", "impresion/refacciones/cabezales/inkjet/hp-designjet-713/3ed58a", "printers_scanners"],
  ["Escaner documental Kodak Alaris S3100 A3 ADF 100 ppm SCAKDK750", "KODAK", "impresion/escaneres/documentales/produccion/adf/a3/kodak-alaris-s3100", "printers_scanners"],
  ["Gel antibacterial Baco GL-001 alcohol 70 caja con 10 frascos de 50 ml ACCBAC010", "BACO", "salud/higiene/desinfectantes/gel-antibacterial/baco-gl-001-10x50ml", "accessories"],
  ["Broche para archivo Baco B-082 8 cm caja 50 piezas ACCBAC030", "BACO", "oficina/papeleria/sujetadores/broches-archivo/8cm/baco-b082-50-piezas", "accessories"],
  ["Clip estandar Baco 12302 No. 1 galvanizado paquete 10 cajas ACCBAC060", "BACO", "oficina/papeleria/sujetadores/clips/estandar/no-1/baco-12302-10-cajas", "accessories"],
  ["Clip estandar Baco 12326 No. 2 galvanizado paquete 10 cajas ACCBAC070", "BACO", "oficina/papeleria/sujetadores/clips/estandar/no-2/baco-12326-10-cajas", "accessories"],
  ["Clip gigante Baco 12296 No. 1 zincado caja con 12 piezas ACCBAC100", "BACO", "oficina/papeleria/sujetadores/clips/gigantes/no-1/baco-12296-12-piezas", "accessories"],
  ["Clip gigante Baco 12319 No. 2 zincado caja con 50 piezas ACCBAC110", "BACO", "oficina/papeleria/sujetadores/clips/gigantes/no-2/baco-12319-50-piezas", "accessories"],
  ["Clip jumbo Baco 12098 zincado caja con 100 clips ACCBAC120", "BACO", "oficina/papeleria/sujetadores/clips/jumbo/baco-12098-100-piezas", "accessories"],
] as const;

describe("manual taxonomy batches 232 plus", () => {
  it.each(batch232Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
