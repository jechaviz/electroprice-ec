import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch250Cases = [
  ["Diadema gamer Game Factor HSB600-BK BOCVGO1620 2.4G Bluetooth negra", "GAME FACTOR", "audio/audifonos/diadema/gaming/inalambricos/2-4ghz-bluetooth-3-5mm/game-factor-hsb600-bk", "headphones"],
  ["Powerbank Necnon NPW-05FB NBPB0501FB 5000mAh BATNNN090", "NECNON", "energia/baterias-portatiles/power-banks/5000mah/necnon-npw-05fb", "power"],
  ["Minisplit Hisense AH121CF 12000 BTU frio calor 110V AIRHSE330", "HISENSE", "climatizacion/aires-acondicionados/minisplit/estandar/12000-btu/110v-frio-calor/hisense-ah121cf", "accessories"],
  ["Kit alarma inalambrico EZVIZ CS-B1 Hub A3 T1C T2C T3C KITEZV020", "EZVIZ", "seguridad/alarmas/kits-inalambricos/ezviz-cs-b1-a3-t1c-t2c-t3c", "security"],
  ["Papel bond Ecobond 17502237370579 oficio 75g 95 blancura PAPECO030", "ECOBOND", "oficina/papel-consumibles/papel-bond/oficio/5000-hojas/ecobond-75g-95", "accessories"],
  ["Lector Datalogic Magellan 3410VSi M3410-010210-00604 USB LCTPSC960", "DATALOGIC", "punto-de-venta/lectores-codigo-barras/2d-usb/area-imager/datalogic-magellan-3410vsi-m3410-010210-00604", "accessories"],
  ["Patin electrico Vorago SC-302-V2 250W 36V SCO-17 ACCVGO2460", "VORAGO", "energia/movilidad-electrica/patines-electricos/plegables/vorago-sc-302-v2", "power"],
  ["Caja de conexiones Provision-ISR PR-JB14IP66 IP66 ACCPVS720", "PROVISION-ISR", "seguridad/cctv/accesorios-camaras/cajas-conexion/impermeables-ip66/provision-pr-jb14ip66", "security"],
  ["Robot de reparto interactivo EC-LINE BELLABOT ROBECL010 PUDU", "EC-LINE", "punto-de-venta/robots-de-servicio/robots-reparto/pudu-bellabot-ec-line", "accessories"],
  ["Robot de reparto interactivo EC-LINE PUDUBOT 2 ROBECL020 PUDU", "EC-LINE", "punto-de-venta/robots-de-servicio/robots-reparto/pudu-pudubot-2-ec-line", "accessories"],
] as const;

describe("manual taxonomy batches 250 plus", () => {
  it.each(batch250Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
