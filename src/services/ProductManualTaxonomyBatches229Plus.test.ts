import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch229Cases = [
  ["Kensington K62610WW funda universal 14 pulgadas sleeve ACCKNS880", "KENSINGTON", "computo/accesorios/mochilas-fundas/fundas-laptop/14-pulgadas/kensington-k62610ww", "accessories"],
  ["EPCOM S-SOP-LEC totem pedestal para lectoras control de acceso ACCEPC400", "EPCOM", "seguridad/control-acceso/accesorios/soportes-pedestales/lectoras/epcom-s-sop-lec", "security"],
  ["Termometro digital IR-200 oral rectal axilar TERGEN010", "GENERICO", "salud/equipo-medico/monitoreo/termometros-digitales-contacto/generico-ir-200", "accessories"],
  ["Yeyian Proud Serie 3500 YDG-33406 diadema gamer blanca 3.5 mm", "YEYIAN", "gaming/audio/headsets/alambricos/3-5mm-microfono-desmontable/yeyian-proud-ydg-33406", "gaming"],
  ["Corsair HS60 PRO Surround Yellow CA-9011214-NA audifonos gamer 7.1 BOCCOR350", "CORSAIR", "audio/audifonos/diadema/gaming/alambricos/3-5mm-usb/corsair-hs60-pro-surround-yellow", "headphones"],
  ["Corsair HS60 PRO Surround Carbon CA-9011213-NA audifonos gamer 7.1 BOCCOR340", "CORSAIR", "audio/audifonos/diadema/gaming/alambricos/3-5mm-usb/corsair-hs60-pro-surround-carbon", "headphones"],
  ["Corsair HS50 PRO Stereo Carbon CA-9011215-NA diadema gamer microfono desmontable", "CORSAIR", "audio/audifonos/diadema/gaming/alambricos/3-5mm-microfono-desmontable/corsair-hs50-pro-carbon", "headphones"],
  ["Corsair HS35 Stereo Blue CA-9011196-NA audifonos gamer azul negro BOCCOR280", "CORSAIR", "audio/audifonos/diadema/gaming/alambricos/3-5mm-microfono-desmontable/corsair-hs35-stereo-blue", "headphones"],
  ["KSA LT01 lentes de seguridad proteccion ocular ACCKSA050", "KSA", "seguridad/epp/proteccion-ocular/lentes-seguridad/ksa-lt01", "accessories"],
  ["IMOU ARD1231-SW sensor de movimiento PIR inalambrico 433MHz ACCDAH1150", "IMOU", "seguridad/alarmas/sensores/movimiento-pir/inalambricos/imou-ard1231-sw", "security"],
] as const;

describe("manual taxonomy batches 229 plus", () => {
  it.each(batch229Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
