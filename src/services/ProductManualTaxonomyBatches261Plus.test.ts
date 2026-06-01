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

const batch263Cases = [
  ["Dell N_DOL2_N1_M3 POL-10392 Dell Pro 14 16 1Y Basic NBD a 3Y ProSupport Plus", "DELL", "servicios-ti/soporte-garantias/dell/prosupport-plus/laptops/dell-pro-14-16/1y-basic-nbd-a-3y-prosupport-plus/n-dol2-n1-m3", "software", {}],
  ["Poly AV4P5AA#AC3 Voyager Legend 30 manos libres Bluetooth cancelacion ruido SPK-2743", "POLY", "telefonia/audio/manos-libres/bluetooth-monoaural/poly-voyager-legend-30-av4p5aa-ac3", "headphones", {}],
  ["Dell N_OPTL1_N1_P5 POL-7717 OptiPlex 3000 1Y Basic NBD a 5Y ProSupport", "DELL", "servicios-ti/soporte-garantias/dell/prosupport/optiplex-3000/1y-basic-nbd-a-5y-prosupport/n-optl1-n1-p5", "software", {}],
  ["Microsoft DG7GMGF0PN5C:0001:Education SWS-5779 Office LTSC Standard for Mac 2024 Education perpetua", "MICROSOFT", "software/licencias/microsoft/office-ltsc/standard-for-mac-2024/education-perpetual/dg7gmgf0pn5c-0001-education", "software", {}],
  ["Qian QOI-A55TC ACCQIA450 totem kiosk 55 pulgadas EAN 7500619011495", "QIAN", "punto-de-venta/kioscos/pantallas-interactivas/totems/55-pulgadas/qian-qoi-a55tc", "accessories", {}],
  ["Mirati MBB01N ELE-19 batidora de mano 200 W accesorios acero inoxidable negro", "MIRATI", "hogar/electrodomesticos/cocina/batidoras/mano/200w/mirati-mbb01n", "accessories", {}],
  ["Corsair CT-9010001-WW ACCCOR480 TM30 pasta termica 3 g UPC 843591074506", "CORSAIR", "computo/componentes/enfriamiento/pasta-termica/corsair-tm30-3g", "components", {}],
  ["GHIA PCGHIA-3517B POL-10531 extension garantia 24 meses adicionales PCGHIA-3517", "GHIA", "servicios-ti/soporte-garantias/ghia/pcghia-3517/24-meses-adicionales/pol-10531", "software", {}],
  ["Mirati MBT01N ELE-16 tostador 800 W 7 niveles de tostado negro", "MIRATI", "hogar/electrodomesticos/cocina/tostadores/2-rebanadas/800w/mirati-mbt01n", "accessories", {}],
  ["Vertiv Liebert RDU101 NIC-4453 IntelliSlot tarjeta comunicacion SNMP para GXT5", "VERTIV", "energia/no-breaks-ups/accesorios/tarjetas-comunicacion/snmp/vertiv-rdu101", "power", {}],
] as const;

const batch264Cases = [
  ["Dahua DH-HAC-HDW1809TLMN-A-LED CAMDAH4560 camara domo HDCVI 4K Full Color 8MP", "DAHUA TECHNOLOGY", "seguridad/cctv/camaras-hdcvi/domo-eyeball/4k-full-color/dahua-hac-hdw1809tlmn-a-led", "cameras", {}],
  ["Sonnoc SNP-LC40DW PROMTD130 proyector laser WXGA 4000 lumenes 20000h", "SONNOC", "video/proyectores/laser/wxga-4000-lumenes/sonnoc-snp-lc40dw", "tvs", {}],
  ["Uniview IPC2322LB-ADZK-H CAMUNV090 camara IP PoE bullet 2MP varifocal IR", "UNIVIEW", "seguridad/cctv/camaras-ip-poe/bullet/2mp-varifocal-ir/uniview-ipc2322lb-adzk-h", "cameras", {}],
  ["Bitdefender TMBDL-103-S SWS-3646 GravityZone Business Security Premium Elite 1 ano 5 nodos", "BITDEFENDER", "software/seguridad/endpoint/bitdefender/gravityzone-business-security-premium/1-ano-sector-privado/tmbdl-103-s", "software", {}],
  ["Hune AT-ACC-CA-316BOS CB-2589 cable Micro USB Hiedra sustentable 1.2m bosque", "HUNE", "accesorios/cables-adaptadores/usb/micro-usb/sustentables-1-2m/hune-hiedra-at-acc-ca-316bos", "laptops", {}],
  ["Logitech 910-006469 MS-1482 Lift Vertical Ergonomic Mouse off-white Bluetooth Logi Bolt", "LOGITECH", "computo/perifericos/mouse/inalambricos/ergonomicos/logitech-lift-910-006469-off-white", "accessories", {}],
  ["be quiet BK024 VENBEQ140 Dark Rock Slim disipador CPU 180W 120mm", "BE QUIET", "computo/componentes/enfriamiento/disipadores-cpu/torre-120mm-180w/be-quiet-dark-rock-slim-bk024", "components", {}],
  ["AOC 16T20 MNL-3011 monitor portatil 15.6 FHD IPS USB-C", "AOC", "computo/monitores/portatiles/15-6-fhd/aoc-16t20", "monitors", {}],
  ["CDP UPO33-120BC40-100 ACCCDP360 banco de baterias para UPO3 trifasico", "CDP", "energia/no-breaks-ups/accesorios/bancos-baterias/trifasicos/80-200kva/cdp-upo33-120bc40-100", "power", {}],
  ["Poly 9T9J4AA#AC3 SPK-2460 Voyager Focus 2 UC Microsoft Teams Bluetooth USB-A", "POLY", "audio/audifonos/bluetooth/diadema-oficina/poly-voyager-focus-2-9t9j4aa-ac3", "headphones", {}],
] as const;

const batch265Cases = [
  ["Stylos STTA3G5A TLCSTY610 tablet 3G Android 11 7 pulgadas 2GB 32GB azul", "STYLOS", "computo/tabletas/android/7-pulgadas/stylos-stta3g5a", "tablets", {}],
  ["BRobotix 190432-36 MEMRBT850 memoria USB 32GB cerdito 2 rosa 7503028136704", "BROBOTIX", "computo/almacenamiento/memorias-flash/usb/32gb/diseno-animado/brobotix-190432-36-cerdito-rosa", "storage", {}],
  ["Getttech GH-3100P BOCGET110 Sonority diadema 3.5mm con microfono rosa", "GETTTECH", "audio/audifonos/alambricos-3-5mm/diadema-con-microfono/getttech-gh-3100p-rosa", "headphones", {}],
  ["Sola Basic ISB XR-21-162 FR-547 Micro SR UPS 1600VA 1000W 6 contactos", "SOLA BASIC ISB", "energia/no-breaks-ups/line-interactive/1600va/sola-basic-xr-21-162", "power", {}],
  ["Canon PFI-007C CARCNN5740 2144C001AA tanque tinta cian 90ml imagePROGRAF", "CANON", "impresion/consumibles/cartuchos-tinta/canon/imageprograf-pfi-007/pfi-007c-2144c001aa", "printers_scanners", {}],
  ["Balam Rush BR-938044 CF-425 Eolox Blaze EX70 ventilador 120mm ARGB 1200RPM", "BALAM RUSH", "computo/componentes/enfriamiento/ventiladores-gabinete/120mm-argb/balam-rush-eolox-blaze-ex70-br-938044", "components", {}],
  ["HPE P77119-B21 SOFHPE870 Windows Server 2025 Remote Desktop Service 1 Device CAL", "HPE", "software/licencias/windows-server/cal-rds/device-cal-2025/hpe-p77119-b21", "software", {}],
  ["Aspel ADM12MPV SWA-745 ADM Premium anual electronico Siigo Aspel", "ASPEL", "software/licencias/aspel-adm/premium-anual/adm12mpv", "software", {}],
  ["Provision-ISR PoES-08120C+2I SWTPVS140 switch PoE CCTV 8 puertos 120W", "PROVISION-ISR", "redes/switches/poe-no-administrables/cctv/8-puertos-120w/provision-isr-poes-08120c-2i", "networking", {}],
  ["AOC 27G4 MONAOC910 monitor gaming 27 FHD IPS 180Hz 1ms", "AOC", "computo/monitores/gaming/27-fhd/180hz/aoc-27g4", "monitors", {}],
] as const;

const batch266Cases = [
  ["BRobotix 190432-24 MEMRBT740 memoria USB 32GB Pirata Rudo 7503027764342", "BROBOTIX", "computo/almacenamiento/memorias-flash/usb/32gb/diseno-animado/brobotix-190432-24-pirata-rudo", "storage", {}],
  ["Acer ED273 Bbmiix MONACR1700 monitor gamer curvo 27 FHD VA 75Hz UM.HE3AA.B01", "ACER", "computo/monitores/gaming/27-fhd/75hz-curvos-va/acer-ed273-bbmiix", "monitors", {}],
  ["Lenovo 4X41C12468 ACCLEN4410 ThinkPad Essential Eco mochila laptop 16 pulgadas", "LENOVO", "computo/accesorios/mochilas-fundas/mochilas-laptop/16-pulgadas/lenovo-thinkpad-essential-eco-4x41c12468", "accessories", {}],
  ["Epson T41P220 CN-4039 UltraChrome XD2 cartucho cian 350ml para SureColor T5470M", "EPSON", "impresion/consumibles/cartuchos-tinta/epson/ultrachrome-xd2/350ml/t41p220-cian", "printers_scanners", {}],
  ["ZKTeco TF1700 SOFZKT170 terminal biometrica huella RFID PIN control acceso", "ZK TECO", "seguridad/control-acceso/asistencia/biometricos/huella-rfid/zkteco-tf1700", "security", {}],
  ["Lexmark T650A11L TONLXM2150 toner negro T65x retorno 7000 paginas 734646064385", "LEXMARK", "impresion/consumibles/toner-laser/lexmark/t65x/t650a11l", "printers_scanners", {}],
  ["Sola Basic ISB XL32-22-280-220 S RE-149 Xellence regulador electronico 8000VA 220V", "SOLA BASIC ISB", "energia/supresores-reguladores/reguladores-voltaje/electronicos/bifasicos-220v/8000va/sola-basic-xellence-xl32-22-280-220-s", "power", {}],
  ["Samsung Odyssey G3 LS27DG300ELXZX MNL-3059 monitor gamer 27 FHD VA 180Hz", "SAMSUNG", "computo/monitores/gaming/27-fhd/180hz/samsung-odyssey-g3-ls27dg300elxzx", "monitors", {}],
  ["BRobotix 6006757 MALRBT450 maletin Oslo para laptop 17 pulgadas gris", "BROBOTIX", "computo/accesorios/mochilas-fundas/maletines-laptop/17-pulgadas/brobotix-oslo-6006757-gris", "accessories", {}],
  ["Acteck Blazar Basic FT500B GABACT400 AC-938150 fuente ATX 500W plata", "ACTECK", "computo/componentes/fuentes-poder/atx-500w/acteck-blazar-basic-ft500b", "components", {}],
] as const;

const batch267Cases = [
  ["Zebra 104523-118 ACCITR620 tarjetas PVC CR80 30 mil panel de firma 500", "ZEBRA", "punto-de-venta/credenciales-identificacion/consumibles/tarjetas-pvc/panel-firma/zebra-104523-118", "accessories", {}],
  ["Nextep NE-240 ACCNTE600 barra multicontacto 6 contactos supresor 490J 7501811275463", "NEXTEP", "energia/supresores-reguladores/supresores-picos/multicontactos/6-contactos/nextep-ne-240", "power", {}],
  ["Balam Rush BR-941983 CF-582 Heliux Pro HEX55 disipador CPU 120mm ARGB TDP 220W", "BALAM RUSH", "computo/componentes/enfriamiento/disipadores-cpu/torre-120mm-argb/tdp-220w/balam-rush-heliux-pro-hex55-br-941983", "components", {}],
  ["Ubiquiti RD-5G34 ANTUBI270 RocketDish airMAX antena 5GHz 34dBi 810354021299", "UBIQUITI", "redes/radioenlaces-antenas/antenas-parabolicas/5ghz-34dbi/ubiquiti-rocketdish-rd-5g34", "networking", {}],
  ["Synology E10G30-T2 NIC-4466 tarjeta red dual 10GbE RJ45 PCIe 3.0 x8", "SYNOLOGY", "redes/tarjetas-red/pcie/10gbe-dual-rj45/synology-e10g30-t2", "networking", {}],
  ["Dell PowerEdge T160-FY26Q1E-MX SER-2334 servidor torre Xeon E-2434 16GB 2TB", "DELL", "computo/servidores/torre/dell-poweredge-t160/t160-fy26q1e-mx", "laptops", {}],
  ["Yaber T2 Plus PROYAB070 proyector portatil 1080p FHD JBL Dolby 450 ANSI", "YABER", "video/proyectores/portatiles/1080p-smart/yaber-t2-plus", "tvs", {}],
  ["Samsung LH75WAFWLGCXZX MNL-2924 LFDSMG1470 WA75F pantalla interactiva 75 UHD Android touch", "SAMSUNG", "video/senalizacion-digital/pantallas-interactivas/75-uhd-touch/samsung-wa75f-lh75wafwlgcxzx", "monitors", {}],
  ["Dahua DHI-LM34-E330CA MONDAH220 monitor gaming curvo 34 UWQHD 200Hz 6923172557377", "DAHUA TECHNOLOGY", "computo/monitores/gaming/ultrawide-curvos/34-uwqhd-200hz/dahua-dhi-lm34-e330ca", "monitors", {}],
  ["Hikvision DS-2CD1183G2-LIUF CV-2146 camara domo IP 8MP dual light 2.8mm microSD mic", "HIKVISION", "seguridad/cctv/camaras-ip-poe/domo/8mp-dual-light-microsd-mic/hikvision-ds-2cd1183g2-liuf", "cameras", {}],
] as const;

const batch268Cases = [
  ["Nextep NE-474S MEMNEX040 memoria microSD 64GB Clase 10 UHS-I U1 con adaptador", "NEXTEP", "computo/almacenamiento/memorias-flash/microsd/64gb-clase-10/uhs-i-u1/nextep-ne-474s", "storage", {}],
  ["HPE HV6C6E POL-6166 Tech Care Essential 3 anos para ProLiant DL385 Gen10", "HPE", "servicios-ti/soporte-garantias/hpe-tech-care/servidores/proliant-dl385-gen10/hv6c6e-3y-essential", "software", {}],
  ["Grandstream GWN7811P NIC-4730 switch Layer 3 PoE 8 puertos Gigabit 2 SFP+ 120W", "GRANDSTREAM", "redes/switches/poe-administrables/gigabit/8-puertos/layer-3-2-sfp-plus/grandstream-gwn7811p", "networking", {}],
  ["Intellinet 561907 SWTITL590 NIC-4595 switch PoE no gestionado 24 Gigabit 2 SFP 370W", "INTELLINET", "redes/switches/poe-no-administrables/gigabit/24-puertos-2-sfp-370w/intellinet-561907", "networking", {}],
  ["BRobotix 102760G ACCRBT2160 funda universal para tablet 10 pulgadas con teclado", "BROBOTIX", "computo/tabletas/accesorios/fundas-con-teclado/universales-10-pulgadas/brobotix-102760g", "accessories", {}],
  ["Kingston DTXS/64GB RAM-4627 DataTraveler Exodia S memoria USB 64GB 3.2 Gen 1 giratoria", "KINGSTON", "computo/almacenamiento/memorias-flash/usb/64gb/usb-3-2-gen-1-giratorias/kingston-datatraveler-exodia-s-dtxs-64gb", "storage", {}],
  ["HPE Aruba R0M47A CB-2808 cable DAC SFP56 50G a SFP56 3m 0190017326900", "HPE ARUBA", "redes/transceptores-convertidores/cables-dac/sfp56/50g-3m/hpe-aruba-r0m47a", "networking", {}],
  ["Lexmark 70C8HY0 TONLXM3630 708HY toner amarillo alto rendimiento 3000 paginas 734646436861", "LEXMARK", "impresion/consumibles/toner-laser/lexmark/708hy/70c8hy0-amarillo", "printers_scanners", {}],
  ["Xerox B105_BI PR-2772 multifuncional laser monocromatico A4 Wi-Fi 21ppm", "XEROX", "impresion/impresoras/multifuncionales-laser/monocromaticas/a4-wifi/xerox-b105-bi", "printers_scanners", {}],
  ["Immortal IMGXBC3 ACCTCH9670 cargador dual para controles Xbox One con 2 baterias", "IMMORTAL", "gaming/consolas/accesorios/cargadores-controles/xbox-one/immortal-imgxbc3", "accessories", {}],
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

  it.each(batch263Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch264Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch265Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch266Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch267Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch268Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
