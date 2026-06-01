import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch258Cases = [
  ["Dell N_VOSNBM1_N1_P3 Vostro notebooks 3000 1Y Basic NBD a 3Y ProSupport POL-7738", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/vostro-notebooks-3000/1y-basic-nbd-a-3y-prosupport", "software"],
  ["Meriva MVA-103LPR brazo de montaje LPR MAPR-400 HC150MER05", "MERIVA TECHNOLOGY", "seguridad/cctv/accesorios-montaje/soportes-pared/lpr/meriva-mva-103lpr", "security"],
  ["Dell N_DPNL3_P3_M5 Dell Pro Plus 14 16 3Y ProSupport a 5Y ProSupport Plus POL-10957", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/laptops/dell-pro-plus-14-16/3y-prosupport-a-5y-prosupport-plus", "software"],
  ["Koblenz ABB80921 banco de baterias 80 piezas para UPS 30 y 40 KVA FR-2035", "KOBLENZ", "energia/no-breaks-ups/accesorios/bancos-baterias/trifasicos/30-40kva/koblenz-abb80921", "power"],
  ["Lenovo 5WS0W86735 ThinkPad 3Y a 5Y Premier Support POL-7115", "LENOVO", "servicios-ti/soporte-garantias/lenovo/premier-support/thinkpad/3y-a-5y/5ws0w86735", "software"],
  ["Lenovo 5WS0U26647 ThinkCentre 3Y Premier Support POL-4922", "LENOVO", "servicios-ti/soporte-garantias/lenovo/premier-support/thinkcentre/3y/5ws0u26647", "software"],
  ["Vorago Start The Game HS-501 diadema gamer 3.5mm USB RGB SPK-2790", "VORAGO", "audio/audifonos/diadema/gaming/alambricos/3-5mm-usb/vorago-start-the-game-hs-501", "headphones"],
  ["GHIA POL-10077 extension de garantia 24 meses adicionales para PCGHIA-3410B", "GHIA", "servicios-ti/soporte-garantias/ghia/pcghia-3410/24-meses-adicionales/pol-10077", "software"],
  ["Dell N_DN_L1_C1_P3 Dell laptops 1Y Carry-In to 3Y ProSupport POL-10710", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/dell-laptops/1y-carry-in-a-3y-prosupport", "software"],
  ["GHIA POL-10967 extension de garantia 12 meses adicionales para PCGHIA-3581A", "GHIA", "servicios-ti/soporte-garantias/ghia/pcghia-3581/12-meses-adicionales/pol-10967", "software"],
] as const;

describe("manual taxonomy batches 258 plus", () => {
  it.each(batch258Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
