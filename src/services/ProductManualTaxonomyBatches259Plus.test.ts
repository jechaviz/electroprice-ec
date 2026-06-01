import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch259Cases = [
  ["Logitech 989-000405 microfono de expansion para MeetUp AC-6362", "LOGITECH", "computo/colaboracion/videoconferencia/accesorios/microfonos-expansion/logitech-meetup-989-000405", "audio"],
  ["GHIA POL-10046 extension de garantia 24 meses adicionales para PCGHIA-3413B", "GHIA", "servicios-ti/soporte-garantias/ghia/pcghia-3413/24-meses-adicionales/pol-10046", "software"],
  ["Dell N_DN_L3_N1_P3 POL-10974 Dell laptops 1Y Next Bus Day a 3Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/dell-laptops/1y-nbd-a-3y-prosupport/n-dn-l3-n1-p3", "software"],
  ["Microsoft Office LTSC Professional Plus 2024 Education DG7GMGF0PN5F:0002:Education SWS-5778", "MICROSOFT", "software/licencias/microsoft/office-ltsc/professional-plus-2024/education-perpetual", "software"],
  ["Cisco AIR-MNT-VERT1 vertical pole wall mounting kit Catalyst 9124AX AC-11843", "CISCO", "redes/access-points/accesorios/montaje/vertical-pared-poste/cisco-air-mnt-vert1", "networking"],
  ["Dell N_DOL2_N3_P5 POL-10499 Dell Pro laptops 3Y NBD a 5Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/dell-pro-laptops/3y-nbd-a-5y-prosupport/n-dol2-n3-p5", "software"],
  ["Epson C12C934591 C9345 caja de mantenimiento para EcoTank L15150 CN-4427", "EPSON", "impresion/consumibles/cajas-mantenimiento/epson-ecotank-l15150/c12c934591", "printers_scanners"],
  ["CDP POL-8034 arranque e instalacion equipos 20 KVA", "CDP", "servicios-ti/instalacion-puesta-en-marcha/cdp/ups/20kva/pol-8034", "software"],
  ["Licuadora Mirati MBL01N 500 W 1.2 L 3 velocidades ELE-18", "MIRATI", "hogar/electrodomesticos/cocina/licuadoras/vaso/1-2l-500w/mirati-mbl01n", "accessories"],
  ["Epson C12C938211 C9382 caja de mantenimiento para WF-C5390 WF-C5890 CN-4807", "EPSON", "impresion/consumibles/cajas-mantenimiento/epson-workforce-pro/wf-c5390-c5890/c12c938211", "printers_scanners"],
] as const;

describe("manual taxonomy batches 259 plus", () => {
  it.each(batch259Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
