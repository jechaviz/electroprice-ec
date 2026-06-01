import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch236Cases = [
  ["Papel opalina blanco DIEM POBTCC100 carta 125 g/m2 paquete 100 hojas ACCDIE540", "DIEM", "oficina/papeleria/papel-cartulina/papel-opalina/carta/diem-pobtcc100-100h", "accessories"],
  ["Cartulina opalina blanca DIEM COBTCC100 carta 225 g/m2 paquete 100 piezas ACCDIE570", "DIEM", "oficina/papeleria/papel-cartulina/cartulina-opalina/carta/diem-cobtcc100-100p", "accessories"],
  ["Telefono IP Cisco CP-7811-3PCC-K9 MPP 1 linea SIP PoE TELCIS280", "CISCO", "telefonia/telefonos-ip/escritorio/1-linea/poe/cisco-7811-3pcc", "networking"],
  ["Sobre coin NASSA MAE IM0130 ante 8.8 x 16.4 cm pegue al centro 500 piezas ACCNAS010", "NASSA", "oficina/papeleria/sobres/coin/ante/8-8x16-4/mae-nassa-im0130-500p", "accessories"],
  ["Marcador de cera Pelikan 50800103 rojo caja con 10 piezas ACCNTE150", "PELIKAN", "oficina/papeleria/marcadores/cera/pelikan/rojo-10-piezas/50800103", "accessories"],
  ["Boligrafo BIC Cristal Dura+ 923996 azul punto mediano 1.0 mm caja con 12 ACCBIC050", "BIC", "oficina/papeleria/boligrafos/boligrafo-punto-mediano/bic-cristal-dura-plus/azul/12-piezas/923996", "accessories"],
  ["Protector de pantalla Topaz A-OLSL-3 para SigLite 1x5 digitalizador de firmas ACCTPZ010", "TOPAZ", "punto-de-venta/digitalizadores-firma/topaz/accesorios/protectores-pantalla/a-olsl-3", "accessories"],
  ["Block JANEL Memo Tip 1173 notas adhesivas 3x3 amarillo 100 hojas ACCJAN030", "JANEL", "oficina/papeleria/notas-adhesivas/blocks/3x3/janel-memotip-1173", "accessories"],
  ["Colores Blanca Nieves 45075 21040 cortos C/12 redondos ACCLAP020", "BLANCA NIEVES", "oficina/papeleria/material-escolar/dibujo-arte/lapices-color/blanca-nieves/cortos-12p/45075", "accessories"],
  ["Colores Blanca Nieves 45074 21050 largos C/12 redondos ACCLAP010", "BLANCA NIEVES", "oficina/papeleria/material-escolar/dibujo-arte/lapices-color/blanca-nieves/largos-12p/45074", "accessories"],
] as const;

describe("manual taxonomy batches 236 plus", () => {
  it.each(batch236Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
