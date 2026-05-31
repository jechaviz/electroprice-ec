import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch220Cases = [
  ["PNY VCNRTXA400ATX-PB NVIDIA RTX A400 4GB GDDR6 VC-1212", "PNY", "computo/componentes/tarjetas-video/nvidia-rtx-profesional/rtx-a400/pny-vcnrtxa400atx-pb", "components"],
  ["BACO 94124 G-20 goma blanca para borrar ACCBAC3640", "BACO", "oficina/papeleria/material-escolar/borradores/blancos/baco-g20-94124", "accessories"],
  ["Datalogic Magellan 1500i MG1501-10211-0200 lector 2D USB LCTPSC900", "DATALOGIC", "punto-de-venta/lectores-codigo-barras/2d-usb/area-imager/datalogic-magellan-1500i", "accessories"],
  ["Gigabyte GV-N4080EAGLE-16GD GeForce RTX4080 Eagle 16GB VC-1087", "GIGABYTE", "computo/componentes/tarjetas-video/nvidia-geforce/rtx-40/rtx-4080/gigabyte-eagle-gv-n4080eagle-16gd", "gaming"],
  ["Dell N_OPTL1_N1_P1 OptiPlex desktops 3000 1 ano NBD a ProSupport POL-7701", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/optiplex-3000/1y-basic-nbd-a-1y-prosupport/n-optl1-n1-p1", "software"],
  ["Azor 6810RO Pin Point rojo 0.7mm caja 12 piezas ACCAZR040", "AZOR", "oficina/papeleria/boligrafos/boligrafo-punta-fina/azor-pinpoint-6810ro-rojo-12-piezas", "accessories"],
  ["BenQ PW03 PointWrite kit interactivo para proyectores ACCBNQ640", "BENQ", "audio-video/proyectores/accesorios/kits-interactivos/benq-pointwrite-pw03", "accessories"],
  ["CyberPower POL-10204 poliza garantia 3 anos UT1000GU", "CYBERPOWER", "servicios-ti/soporte-garantias/cyberpower/ups-line-interactive/ut1000gu/3y/pol-10204", "software"],
  ["Cisco C9200-NM-4X Catalyst 9200 modulo red 4x 1G/10G ACCCIS740", "CISCO", "redes/switches/modulos-uplink/cisco-catalyst-9200/c9200-nm-4x", "networking"],
  ["Zebra P1123335-057 cabezal termico 300 dpi ZT111 ZT211 ZT231 ACCZBR3400", "ZEBRA", "impresion/refacciones/cabezales/termicos/zebra/zt111-zt211-zt231-300dpi/p1123335-057", "printers_scanners"],
] as const;

describe("manual taxonomy batches 220 plus", () => {
  it.each(batch220Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
