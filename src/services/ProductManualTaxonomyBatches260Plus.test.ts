import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch260Cases = [
  ["Pantalla interactiva Quinyx QTX-TE-QS1-98 98 4K Android 14 PANQNX030", "QUINYX", "electronica/pantallas-y-monitores/pizarrones-interactivos/pantallas-colaboracion/98-pulgadas/quinyx-qtx-te-qs1-98", "accessories"],
  ["Servidor Dell PowerEdge R360 rack 1U SERDDL170", "DELL", "computo/servidores/rack/1u/dell-poweredge-r360", "laptops"],
  ["Refrigerador LG GM39BVP InstaView French Door 29 pies plata REFLGE170", "LG", "hogar/electrodomesticos/refrigeradores/french-door/29-pies/lg-gm39bvp", "accessories"],
  ["Dell N_DPROVL1_N1_N3 POL-11215 Dell Pro Laptops 1Y Basic NBD a 3Y Basic NBD", "DELL", "servicios-ti/soporte-garantias/dell/basic-nbd/dell-pro-laptops/1y-a-3y/n-dprovl1-n1-n3", "software"],
  ["Microsoft Excel LTSC 2024 Commercial DG7GMGF0PN5H:0002:Commercial SWS-5777", "MICROSOFT", "software/licencias/microsoft/excel/ltsc-2024/commercial-perpetual", "software"],
  ["CDP SNMPTXWEBPRO tarjeta interna SNMP Web Pro para UPS NIC-5181", "CDP", "energia/no-breaks-ups/accesorios/tarjetas-comunicacion/snmp/cdp-snmptxwebpro", "power"],
  ["Refrigerador LG GM29BIP French Door 29 pies plata platino REFLGE160", "LG", "hogar/electrodomesticos/refrigeradores/french-door/29-pies/lg-gm29bip", "accessories"],
  ["Dell N_DOL2_N1_N3 POL-10414 Dell Pro 14 16 laptops 1Y Basic NBD a 3Y Basic NBD", "DELL", "servicios-ti/soporte-garantias/dell/basic-nbd/dell-pro-laptops/1y-a-3y/n-dol2-n1-n3", "software"],
  ["Ocelot Gaming OFKIT-2 kit 3 ventiladores ARGB 120mm CF-286", "OCELOT GAMING", "computo/componentes/enfriamiento/ventiladores-gabinete/kits-120mm-argb/ocelot-ofkit-2", "components"],
  ["Soft Restaurant SR-12PRO-RA 12 Pro renta anual 10 nodos KITNTS4410", "SOFT RESTAURANT", "punto-de-venta/software-pos/restaurantes/licencias-renta-anual/soft-restaurant-12-pro-10-nodos", "software"],
] as const;

describe("manual taxonomy batches 260 plus", () => {
  it.each(batch260Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
