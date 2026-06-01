import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch256Cases = [
  ["Dell N_ANWDTM1_C1_U3 POL-7744 Premium Support Plus Alienware Aurora R13", "DELL", "servicios-ti/soporte-garantias/dell/premium-support-plus/alienware-aurora-r13/1y-carry-in-a-3y-premium-support-plus", "software"],
  ["Dell N_OPTL3_N3_N5 POL-10120 OptiPlex 7010 7020 3Y Basic NBD a 5Y Basic NBD", "DELL", "servicios-ti/soporte-garantias/dell/basic-nbd/optiplex-7010-7020/3y-a-5y", "software"],
  ["Dell N_OPTL1_N3_N5 POL-7732 OptiPlex 3000 3Y Basic NBD a 5Y Basic NBD", "DELL", "servicios-ti/soporte-garantias/dell/basic-nbd/optiplex-3000/3y-a-5y", "software"],
  ["Dell N_OPTM1_N3_N5 EXTDLL9590 OptiPlex Micro 3Y Basic NBD a 5Y Basic NBD", "DELL", "servicios-ti/soporte-garantias/dell/basic-nbd/optiplex-micro/3y-a-5y", "software"],
  ["Dell N_OPTL3_P3_M5 POL-7710 OptiPlex 7000 3Y ProSupport a 5Y ProSupport Plus", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/desktops/optiplex-7000/3y-prosupport-a-5y-prosupport-plus", "software"],
  ["Dell N_INSPNBL4_C1_U3 POL-7723 Inspiron G15 5000 7000 2 en 1 Premium Support Plus", "DELL", "servicios-ti/soporte-garantias/dell/premium-support-plus/inspiron-g15-5000-7000-2in1/1y-carry-in-a-3y-premium-support-plus", "software"],
  ["Dell N_ANWNBM3_C1_U3 POL-8387 Alienware X14 M16 Premium Support Plus", "DELL", "servicios-ti/soporte-garantias/dell/premium-support-plus/alienware-notebooks-x14-m16/1y-carry-in-a-3y-premium-support-plus", "software"],
  ["Dell N_INSPDTM1_C1_U3 POL-7716 Inspiron Desktops 5000 Premium Support Plus", "DELL", "servicios-ti/soporte-garantias/dell/premium-support-plus/inspiron-desktops-5000/1y-carry-in-a-3y-premium-support-plus", "software"],
  ["Dell N_OPTL1_N3_P5 POL-7715 OptiPlex 3000 3Y Basic NBD a 5Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/optiplex-3000/3y-basic-nbd-a-5y-prosupport", "software"],
  ["Dell N_INSPNBL1_C1_C3 POL-7740 Inspiron Notebooks 3000 1Y Carry-In a 3Y Carry-In", "DELL", "servicios-ti/soporte-garantias/dell/carry-in/inspiron-notebooks-3000/1y-a-3y-carry-in", "software"],
] as const;

describe("manual taxonomy batches 256 plus", () => {
  it.each(batch256Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
