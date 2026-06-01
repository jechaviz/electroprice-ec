import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch253Cases = [
  ["Plotter HP DesignJet T850 36 pulgadas 2Y9H2A PLOHPD770 multifuncional", "HP", "impresion/impresoras/gran-formato/multifuncionales/36-pulgadas/hp-designjet-t850-2y9h2a", "printers_scanners"],
  ["Minisplit Hisense AH182CF 18000 BTU frio calor 230V AIRHSE360", "HISENSE", "climatizacion/aires-acondicionados/minisplit/estandar/18000-btu/230v-frio-calor/hisense-ah182cf", "accessories"],
  ["Sensor de movimiento TP-Link Tapo T100 AC-11786 ACCTPL930", "TP LINK", "domotica/sensores/movimiento/tp-link-tapo-t100", "accessories"],
  ["Servidor NAS Synology DS1522+ 5 bahias SERTRD1330", "SYNOLOGY", "computo/almacenamiento/nas/5-bahias/synology-ds1522-plus", "storage"],
  ["Minisplit LG MW122C4 11000 BTU solo frio 230V AIRLGE560", "LG", "climatizacion/aires-acondicionados/minisplit/estandar/12000-btu/230v-solo-frio/lg-mw122c4", "accessories"],
  ["Bolsa de hombro Perfect Choice Holdi PC-085034 MALGEN4640", "PERFECT CHOICE", "computo/accesorios/mochilas-fundas/bolsos-crossbody/compactos/perfect-choice-holdi-pc-085034", "accessories"],
  ["Tarjeta de monitoreo VICA SNMP PLUS ACCVIC310 NIC-4940", "VICA", "energia/no-breaks-ups/accesorios/tarjetas-comunicacion/snmp/vica-snmp-plus", "power"],
  ["Licencia Hillstone BDL-A200-IN12 A200 NGFW IPS AV URL QoS 12 meses FIRHST020", "Hillstone", "software/licencias/seguridad-red/hillstone/a200/bdl-12m/bdl-a200-in12", "software"],
  ["Modulo Cisco Catalyst C9300X-NM-8Y= 8 puertos 25G 10G ACCCIS1860", "CISCO", "redes/switching/modulos-red/cisco-catalyst-9300x/8y-c9300x-nm-8y", "networking"],
  ["Riel para rack CyberPower 4POSTRAIL 4 postes ACCCYP320", "CyberPower", "energia/no-breaks-ups/accesorios/rieles-rack/4-postes/cyberpower-4postrail", "power"],
] as const;

describe("manual taxonomy batches 253 plus", () => {
  it.each(batch253Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
