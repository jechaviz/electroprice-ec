import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch235Cases = [
  ["Lapiz BACO 55408 bicolor azul rojo caja con 12 piezas ACCBAC2830", "BACO", "oficina/papeleria/material-escolar/escritura/lapices-bicolor/baco-55408-12p", "accessories"],
  ["Cojin de asiento Kensington P4936 Memory Foam negro ACCKNS1780", "KENSINGTON", "oficina/ergonomia/cojines-asiento/espuma-viscoelastica/kensington-p4936", "accessories"],
  ["Cubrebocas KN95 Azul KSA PH007 con valvula CUBKSA110", "KSA", "salud/higiene/cubrebocas/kn95/azul-valvula/ksa-ph007", "accessories"],
  ["Folder tamano Carta DIEM MF01C100 color crema paquete 100 ACCDIE010", "DIEM", "oficina/papeleria/archivo/folders/carta/crema/100-piezas/diem-mf01c100", "accessories"],
  ["Folder tamano Oficio DIEM MF01OC100 color crema paquete 100 ACCDIE020", "DIEM", "oficina/papeleria/archivo/folders/oficio/crema/100-piezas/diem-mf01oc100", "accessories"],
  ["CONTROLADORA CLOUD Omada OC300 TP-Link ACCTPL650", "Omada", "redes/controladoras/omada/hardware-controller/tp-link-oc300", "networking"],
  ["Candado delgado con combinacion KENSINGTON K68009WW N17 Slim ACCKNS1160", "KENSINGTON", "accesorios/seguridad-fisica/candados-laptop/combinacion/n17-slim/kensington-k68009ww", "accessories"],
  ["Cabezal ZEBRA 105934-037 para GK420D GX420D 203 dpi CARZBR1300", "ZEBRA", "impresion/refacciones/cabezales/termicos/zebra/gk420d-gx420d-203dpi/105934-037", "printers_scanners"],
  ["Kit de Almohadas Yeyian YKA-20705 silla gamer Aren Serie 2500 ACCYEY150", "Yeyian", "gaming/mobiliario/sillas-gamer/accesorios/cojines/yeyian-yka-20705", "gaming"],
  ["Filtro EPSON V13H134A32 ELPAF32 aire para proyector ACCEPS450", "EPSON", "video/accesorios-proyeccion/filtros-aire/epson-elpaf32-v13h134a32", "accessories"],
] as const;

describe("manual taxonomy batches 235 plus", () => {
  it.each(batch235Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
