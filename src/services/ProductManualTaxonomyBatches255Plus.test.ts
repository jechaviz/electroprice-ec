import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch255Cases = [
  ["Dell N_INSPDTM1_C1_R3 POL-7705 Premium Support Inspiron Desktops 5000", "DELL", "servicios-ti/soporte-garantias/dell/premium-support/inspiron-desktops-5000/1y-carry-in-a-3y-premium-support", "software"],
  ["Dell N_OPTL3_P3_M3 POL-7694 ProSupport Plus OptiPlex 7000 3Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/desktops/optiplex-7000/3y-prosupport-a-3y-prosupport-plus", "software"],
  ["Dell N_OPTL3_N3_P3 POL-8070 ProSupport OptiPlex 7010 Basic NBD", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/optiplex-7010/3y-basic-nbd-a-3y-prosupport", "software"],
  ["Dell N_ANWDTM1_C1_R3 POL-7702 Premium Support Alienware Aurora R13 desktop", "DELL", "servicios-ti/soporte-garantias/dell/premium-support/alienware-aurora-r13/1y-carry-in-a-3y-premium-support", "software"],
  ["Dell N_INSPNBL4_C1_C3 POL-7742 Carry In Inspiron Gaming G15 5000 7000 2 en 1", "DELL", "servicios-ti/soporte-garantias/dell/carry-in/inspiron-notebooks-g15-5000-7000-2in1/1y-a-3y-carry-in", "software"],
  ["Dell N_INSPNBL1_C1_R3 POL-7743 Premium Support Inspiron Notebooks 3000", "DELL", "servicios-ti/soporte-garantias/dell/premium-support/inspiron-notebooks/inspiron-3000/1y-carry-in-a-3y-premium-support", "software"],
  ["Dell N_INSPNBL4_C1_R3 POL-7724 Premium Support Inspiron G15 5000 7000 2 en 1", "DELL", "servicios-ti/soporte-garantias/dell/premium-support/inspiron-notebooks/inspiron-g15-5000-7000-2in1/1y-carry-in-a-3y-premium-support", "software"],
  ["Dell N_OPTL3_P3_P5 POL-7713 ProSupport OptiPlex 7000 3Y a 5Y", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/optiplex-7000/3y-prosupport-a-5y-prosupport", "software"],
  ["Dell N_OPTL3_N3_M3 POL-8069 ProSupport Plus OptiPlex 7010 3Y Basic NBD", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/desktops/optiplex-7010/3y-basic-nbd-a-3y-prosupport-plus", "software"],
  ["Dell N_INSPDTM1_N1_M3 POL-9450 ProSupport Plus Inspiron Desktop SFF 3030", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/desktops/inspiron-desktops-sff-3030/1y-basic-nbd-a-3y-prosupport-plus", "software"],
] as const;

describe("manual taxonomy batches 255 plus", () => {
  it.each(batch255Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
