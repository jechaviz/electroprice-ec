import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch261Cases = [
  ["Conector inteligente Wi-Fi Perfect Choice PC-108054 blanco 10A AC-8697", "PERFECT CHOICE", "domotica/contactos-inteligentes/wifi/perfect-choice-pc-108054", "accessories", {}],
  ["Dell N_PTL1_N3_M3 POL-11264 Dell Pro Slim MFF 3Y Basic NBD a ProSupport Plus", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/desktops/dell-pro-slim-mff/3y-basic-nbd-a-3y-prosupport-plus/n-ptl1-n3-m3", "software", {}],
  ["Lenovo 5TS1B66173 Transition CFS Handling Charge POL-10756", "LENOVO", "servicios-ti/servicios-profesionales/lenovo/cfs-transition-handling/5ts1b66173", "software", {}],
  ["GHIA PCGHIA-3169B POL-8171 extension garantia 24 meses adicionales", "GHIA", "servicios-ti/soporte-garantias/ghia/pcghia-3169/24-meses-adicionales/pol-8171", "software", {}],
  ["Sola Basic ISB 15-81-120-4000 corrector de voltaje 4000 VA RE-61", "SOLA BASIC ISB", "energia/supresores-reguladores/reguladores-voltaje/correctores-electromagneticos/4000va/sola-basic-15-81-120-4000", "power", {}],
  ["ElectroPrice TAPO producto-tecno camara TP-Link Tapo interior", "ElectroPrice", "seguridad/cctv/camaras-ip-wifi/interior/modelo-pendiente/tp-link-tapo-familia", "cameras", { "Canonical key": "electropricetapo", "SKU": "TAPO", "Provider": "tecnosinergia" }],
  ["Microsoft SPP-00005 Microsoft 365 Apps for Business ESD anual 1 usuario SWS-4150", "MICROSOFT", "software/productividad-oficina/microsoft-365/apps-for-business/esd-anual-1-usuario/spp-00005", "software", {}],
  ["Canon 9705B007AA imageFORMULA P-215II Scan-tini escaner portatil SC-176", "CANON", "impresion/escaneres/documentales/portatiles/adf/duplex/canon-imageformula-p-215ii", "printers_scanners", {}],
  ["Dell N_VOSDTM2_N1_M3 Vostro Desktop 3000 1Y Basic NBD a 3Y ProSupport Plus POL-7728", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/desktops/vostro-3000/1y-basic-nbd-a-3y-prosupport-plus/n-vosdtm2-n1-m3", "software", {}],
  ["UNV Uniview TR-CM24-IN soporte pendant interior para domo HC140UNV69", "UNV", "seguridad/cctv/accesorios-montaje/soportes-techo/pendant-domo/unv-tr-cm24-in", "security", {}],
] as const;

const batch262Cases = [
  ["Huawei 02120814-004N-DPS AC-11447 PDU2000-16-1PH-8/0-B1 8 C13 1U", "HUAWEI", "energia/pdu-rack/basicos/1u-16a-8-c13/huawei-pdu2000-02120814-004n-dps", "power", {}],
  ["Panasonic SE-NSP960FULL POL-7487 activacion maxima capacidad KX-NS1000 troncales IP extensiones IP", "PANASONIC", "telefonia/conmutadores-ip/panasonic-kx-ns1000/licencias/activacion-full/se-nsp960full", "software", {}],
  ["EPCOM B8-TURBO-G2P/A 193418 bala TurboHD 2MP audio Coaxitron IP66", "EPCOM", "seguridad/cctv/camaras-turbohd/bullet/2mp-ir-audio-coaxitron/epcom-b8-turbo-g2p-a", "cameras", {}],
  ["Dell N_INSPNBL3_C1_C3 POL-7729 Inspiron Notebooks 5000 1Y Carry-In a 3Y Carry-In", "DELL", "servicios-ti/soporte-garantias/dell/basic-carry-in/inspiron-notebooks-5000/1y-a-3y/n-inspnbl3-c1-c3", "software", {}],
  ["VICA TARJETA SNMP NIC-3968 tarjeta de monitoreo UPS", "VICA", "energia/no-breaks-ups/accesorios/tarjetas-comunicacion/snmp/vica-snmp-basica", "power", {}],
  ["Lenovo 5PS8C05777 POL-11032 3Y ADP One Accidental Damage Protection", "LENOVO", "servicios-ti/soporte-garantias/lenovo/adp/3y/5ps8c05777", "software", {}],
  ["Baseus B00052803811-00 AC-12823 Flite UltraJoy hub USB-C 7 puertos HDMI 4K60 PD SD TF", "BASEUS", "computo/accesorios/hubs-usb/usb-c/7-en-1/baseus-ultrajoy-b00052803811-00", "laptops", {}],
  ["Dell N_OPTL3_N3_P5 POL-9448 OptiPlex 7000 3Y Basic NBD a 5Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/optiplex-7000/3y-basic-nbd-a-5y-prosupport/n-optl3-n3-p5", "software", {}],
  ["Gigabyte GV-N406TAERO OC-16GD VC-1188 RTX 4060 Ti AERO OC 16G GDDR6", "GIGABYTE", "computo/componentes/tarjetas-video/nvidia-geforce/rtx-40/rtx-4060-ti/gigabyte-aero-gv-n406taero-oc-16gd", "gaming", {}],
  ["Dell N_VOSNBM3_N1_P3 POL-7739 Vostro Notebooks 5000 1Y Basic NBD a 3Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/vostro-notebooks-5000/1y-basic-nbd-a-3y-prosupport/n-vosnbm3-n1-p3", "software", {}],
] as const;

describe("manual taxonomy batches 261 plus", () => {
  it.each(batch261Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch262Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
