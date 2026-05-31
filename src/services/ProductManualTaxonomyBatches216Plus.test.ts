import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch216Cases = [
  ["Azor Signal Metalink 30009 marcador dorado punto fino caja 12 piezas", "AZOR", "oficina/papeleria/marcadores/permanentes/metalicos/dorado/12-piezas/azor-signal-metalink-30009", "accessories"],
  ["VICA FR-2285 banco de baterias externo Alpha 1500 para UPS", "VICA", "energia/no-breaks-ups/accesorios/bancos-baterias/rack-torre/1500va/vica-alpha-1500", "power"],
  ["Eaton Tripp Lite SRCOOL7KRM SmartRack aire acondicionado rack 7000 BTU 8U 120V", "TRIPP-LITE", "infraestructura/enfriamiento-centros-datos/unidades-rack/aire-acondicionado/8u-120v/tripp-lite-srcool7krm", "components"],
  ["BACO PL002 plastilina marqueta 180 g color piel No 50", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/piel/baco-pl002", "accessories"],
  ["CDP POL-11419 garantia en sitio 3 anos para UPS 6 KVA", "CDP", "servicios-ti/soporte-garantias/cdp/polizas-sitio/ups-6kva/pol-11419", "software"],
  ["CyberPower PDU24001 PDU ATS medible 15A 1U 120V 10 NEMA 5-15R", "CYBERPOWER", "energia/pdu-rack/ats/1u-15a-10-contactos/cyberpower-pdu24001", "power"],
  ["Cisco Meraki LIC-MX64-SEC-3YR licencia Advanced Security 3 anos para MX64", "CISCO", "software/licencias/seguridad-red/cisco-meraki/mx64/advanced-security-3y", "software"],
  ["Dell N_INSPDTM1_N1_P3 upgrade Inspiron Desktop SFF 3030 1Y Basic a 3Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/inspiron-desktops-sff-3030/1y-basic-nbd-a-3y-prosupport", "software"],
  ["BACO 99396 resaltador Bacoflash naranja punta cincel caja 12 piezas", "BACO", "oficina/papeleria/marcadores/resaltadores/naranja/12-piezas/baco-bacoflash-99396", "accessories"],
  ["Lenovo JZ00YBCX Essential Service 1Y 24x7 4HR Response ThinkSystem ST50 V3", "LENOVO", "servicios-ti/soporte-garantias/lenovo/thinksystem/st50-v3/essential-1y-24x7-4hr/jz00ybcx", "software"],
] as const;

describe("manual taxonomy batches 216 plus", () => {
  it.each(batch216Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
