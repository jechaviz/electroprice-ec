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

const batch269Cases = [
  ["Complet UPS-MAR-40 NBKCOM760 UPS-1-059 online trifasico 40kVA 32000W 220V", "COMPLET", "energia/no-breaks-ups/doble-conversion/trifasicos/40000va/complet-ups-mar-40", "power", {}],
  ["ADATA CACC-100PN-BK CABDAT280 cable USB-C a USB-C 1m 100W PD 3.0 negro", "ADATA", "accesorios/cables-adaptadores/usb/usb-c-c/1m/100w/adata-cacc-100pn-bk", "accessories", {}],
  ["Intellinet 561211 ACCITL4720 AC-6593 extensor PoE+ Gigabit IP65 25W hasta 100m", "INTELLINET", "redes/poe/extensores/gigabit/exterior-ip65/intellinet-561211", "networking", {}],
  ["OvalTech OTA1820 BATOVL1200 bateria Apple MacBook Pro 15 A1707 A1820 6680mAh", "OVALTECH", "computo/accesorios/baterias-laptop/apple/macbook-pro-15-a1707/ovaltech-ota1820", "accessories", {}],
  ["ASUS PRIME H610M-K D4-CSM MBDASS6230 tarjeta madre Intel H610 LGA1700 DDR4 micro ATX", "ASUS", "computo/componentes/tarjetas-madre/intel-lga1700/h610/ddr4-micro-atx/asus-prime-h610m-k-d4-csm", "components", {}],
  ["APC SRT192BP BATAPC420 FR-1117 paquete baterias externo Smart-UPS SRT 192V 5kVA 6kVA", "APC", "energia/no-breaks-ups/accesorios/bancos-baterias/rack-torre/192v/apc-srt192bp", "power", {}],
  ["Tripp Lite P512-006 CABTRL1580 cable VGA HD15 macho macho 1.83m negro 037332012364", "TRIPP-LITE", "accesorios/cables-adaptadores/video-vga/hd15-1-8m/tripp-lite-p512-006", "accessories", {}],
  ["Honeywell Xenon XP 1952G-BF LCTMTR1840 lector codigo barras inalambrico 2D battery-free", "HONEYWELL", "punto-de-venta/lectores-codigo-barras/inalambricos/2d/honeywell-xenon-xp-1952g-bf", "accessories", {}],
  ["Dahua DHI-LM27-P301A MNL-2391 monitor profesional 27 QHD IPS USB-C 65W", "DAHUA DISPLAY", "computo/monitores/profesionales/27-qhd-usb-c-65w/dahua-dhi-lm27-p301a", "monitors", {}],
  ["Nextep NE-128 ACCNTE200 perforadora manual oficina 1 orificio 6mm 7501811272561", "NEXTEP", "oficina/equipo-oficina/perforadoras/1-orificio-6mm/nextep-ne-128", "accessories", {}],
] as const;

const batch270Cases = [
  ["Apple IPH14PM128/PL CELMAC660 iPhone 14 Pro Max 128GB eSIM Plata RFB", "APPLE", "telefonia/smartphones/apple/iphone/iphone-14-pro-max/128gb-esim-plata-rfb/iph14pm128-pl", "smartphones", {}],
  ["Stylos STTA81A TLCSTY670 tablet Android 8 pulgadas 2GB 32GB azul con funda 7503041018407", "STYLOS", "computo/tabletas/android/8-pulgadas/2gb-32gb/stylos-stta81a", "tablets", {}],
  ["Nextep NE-017N ACCNEX2290 sobre con burbuja grande autoadherible No.5 paquete 25 10.5 x 16", "NEXTEP", "oficina/papeleria/sobres/acolchados-burbuja/no-5-10-5x16-paquete-25/nextep-ne-017n", "accessories", {}],
  ["Ocelot Gaming A-CUBE 1 CS-870 gabinete gamer ATX M-ATX ITX cristal templado GPU 410mm", "OCELOT GAMING", "computo/componentes/gabinetes/gaming/atx-mid-tower/cubo-cristal-argb/ocelot-a-cube-1", "components", {}],
  ["Yeyian YTM-28207R TECYEY130 teclado gamer Asward Serie 3000 mecanico switch rojo RGB 7503028761579", "YEYIAN", "computo/perifericos/teclados/gaming/mecanicos/full-size-rgb/switch-rojo/yeyian-asward-ytm-28207r", "gaming", {}],
  ["Apple IPH13PM256/VD CELMAC1540 iPhone 13 Pro Max 256GB verde RFB", "APPLE", "telefonia/smartphones/apple/iphone/iphone-13-pro-max/256gb-verde-rfb/iph13pm256-vd", "smartphones", {}],
  ["Balam Rush BR-940382 KB-1090 Dominate Expert GK979I teclado gamer dual recargable RGB", "BALAM RUSH", "computo/perifericos/teclados/gaming/mecanicos/inalambricos-full-size-rgb/balam-rush-dominate-gk979i-br-940382", "gaming", {}],
  ["Cambium Networks XV2-22H0A00-RW ACPCAM060 cnPilot XV2-22H WiFi 6 wall plate", "CAMBIUM NETWORKS", "redes/access-points/wifi-6/wall-plate/cambium-xv2-22h0a00-rw", "networking", {}],
  ["Acteck EP425 BOCACT180 Boost Plus audifonos bluetooth in ear 7506215935104", "ACTECK", "audio/audifonos/bluetooth/tws/in-ear/acteck-boost-plus-ep425", "headphones", {}],
  ["Xzeal XZ05R SILSTY070 silla gamer roja soporte lumbar 110kg 7503027017110", "XZEAL", "gaming/mobiliario/sillas-gamer/pvc/reclinables-110kg/xzeal-xz05r-roja", "gaming", {}],
] as const;

const batch271Cases = [
  ["Dell P2724DEB MNL-2878 210-BSSP monitor 27 QHD USB-C 90W videoconferencia webcam", "DELL", "computo/monitores/profesionales/27-qhd-usb-c-90w/videoconferencia/dell-p2724deb", "monitors", {}],
  ["MaxCases ASESF31204GRY AC-12888 Extreme Shell-F3 ASUS CR CZ BR 1104 1204", "MAXCASE", "computo/accesorios/mochilas-fundas/fundas-laptop/rugged-chromebook/asus-11-6-12-2/maxcases-asesf31204gry", "accessories", {}],
  ["Lenovo 83K700AXLM NOT-10818 IdeaPad Slim 3 15ARP10 Ryzen 7 7735HS 15.3 WUXGA", "LENOVO", "computo/laptops/consumo/15-3-pulgadas/lenovo-ideapad-slim-3-15arp10/83k700axlm", "laptops", {}],
  ["Dahua DH-PFS3005-5GT NIC-4529 switch gigabit 5 puertos no administrable", "DAHUA", "redes/switches/no-administrables/gigabit/5-puertos/dahua-dh-pfs3005-5gt", "networking", {}],
  ["Xerox D50 XD50-U 100N04059 SC-339 escaner documental ADF duplex 70ppm", "XEROX", "impresion/escaneres/documentales/adf/duplex/a4-legal/alto-volumen/xerox-d50-100n04059", "printers_scanners", {}],
  ["Hikvision NVR-104H-D/4P(D) NVR-192 NVR PoE 4 canales 6MP AcuSense", "HIKVISION", "seguridad/cctv/dvr-nvr/nvr-poe/4-canales-6mp/hikvision-nvr-104h-d-4p-d", "cameras", {}],
  ["Bitdefender TMBDL-103-S-R SWS-4593 GravityZone Business Security Premium renovacion sector privado", "BITDEFENDER", "software/seguridad/endpoint/bitdefender/gravityzone-business-security-premium/1-ano-sector-privado/renovacion/tmbdl-103-s-r", "software", {}],
  ["be quiet BGW77 GABBEQ380 Pure Base 501 DX White gabinete ATX alto flujo ARGB", "BE QUIET", "computo/componentes/gabinetes/gaming/atx-mid-tower/alto-flujo-argb/blanco/be-quiet-pure-base-501-dx-bgw77", "components", {}],
  ["Acteck AC-936187 MS-1539 Virtuos Pro MI780 mouse vertical inalambrico 3200 DPI", "ACTECK", "computo/perifericos/mouse/inalambricos/ergonomicos/recargables-3200-dpi/acteck-virtuos-pro-mi780-ac-936187", "accessories", {}],
  ["Hikvision DS-2CD2T47G2-L(C) CAMHKV3120 ColorVu 4MP bullet PoE luz blanca", "HIKVISION", "seguridad/cctv/camaras-ip-poe/bullet/4mp-colorvu-luz-blanca/hikvision-ds-2cd2t47g2-l-c", "cameras", {}],
] as const;

const batch272Cases = [
  ["ASUS VT169HE MNL-3049 monitor tactil 15.6 FHD HDMI VGA 10 puntos", "ASUS OEM", "computo/monitores/tactiles/15-6-fhd/asus-vt169he", "monitors", {}],
  ["Honeywell EDA10A-11BE64N21RK LCTMTR2210 ScanPal EDA10A tablet rugged POS WiFi 6", "HONEYWELL", "punto-de-venta/terminales-moviles/tabletas-rugged/android-10-pulgadas/honeywell-scanpal-eda10a-11be64n21rk", "accessories", {}],
  ["Acteck AC-937061 AC-11847 Port X4 DH422 hub 4 en 1 USB-A 3 USB 2.0 1 USB 3.0", "ACTECK", "computo/accesorios/hubs-usb/usb-a/4-puertos/acteck-port-x4-dh422-ac-937061", "accessories", {}],
  ["Lexmark MS531dw 38S0305 PR-2598 impresora laser monocromatica 46ppm WiFi Ethernet duplex", "LEXMARK", "impresion/impresoras/laser/monocromaticas/a4-wifi-duplex/lexmark-ms531dw-38s0305", "printers_scanners", {}],
  ["Dahua DH-KIT/XVR5104HS-4KL-I3/4-HFW1500CMN-A-0280B-S2 DVR-351 kit 4 canales 5MP", "DAHUA", "seguridad/cctv/kits-videovigilancia/hdcvi/4-canales-5mp/dahua-kit-xvr5104hs-4kl-i3-4-hfw1500cmn-a", "cameras", {}],
  ["Sharp MXB350P MX-B350P PR-2154 impresora laser monocromatica A4 WiFi duplex 35ppm", "SHARP", "impresion/impresoras/laser/monocromaticas/a4-wifi-duplex/sharp-mx-b350p", "printers_scanners", {}],
  ["Poly 76U48AA SPK-2279 Voyager 4310 UC monaural Bluetooth USB-A BT700", "POLY", "audio/audifonos/bluetooth/monoaurales-uc/poly-voyager-4310-76u48aa", "headphones", {}],
  ["QNAP TS-832PX-4G-US SAM-717 NAS 8 bahias SATA 2.5GbE 10GbE SFP+", "QNAP", "computo/almacenamiento/nas/8-bahias/10gbe-2-5gbe/qnap-ts-832px-4g-us", "storage", {}],
  ["Samsung VM46B-U LFDSMG1130 monitor profesional videowall 46 FHD 500 nits", "SAMSUNG", "video/senalizacion-digital/videowall/46-fhd-500nit/samsung-vm46b-u", "monitors", {}],
  ["Dahua DH-IPC-HDW2549T-S-PV CAMDAH5800 camara domo IP 5MP dual light disuasion activa", "DAHUA TECHNOLOGY", "seguridad/cctv/camaras-ip-poe/domo/5mp-dual-light/active-deterrence/dahua-ipc-hdw2549t-s-pv", "cameras", {}],
] as const;

const batch273Cases = [
  ["Cisco C9200L-48T-4G-E NIC-3725 SWTCIS2840 Catalyst 9200L 48 puertos 4x1G Network Essentials", "CISCO", "redes/switches/administrables/gigabit/48-puertos-4-sfp/cisco-catalyst-c9200l-48t-4g-e", "networking", {}],
  ["HPE N7P37A AC-6610 StoreEver MSL LTO-7 Ultrium 15000 SAS Drive Upgrade Kit", "HEWLETT PACKARD ENTERPRISE", "computo/almacenamiento/cintas-lto/unidades-lto/lto-7/hpe-storeever-msl-lto7-n7p37a", "storage", {}],
  ["Tripp Lite U436-06N-GB ACCTRL5030 adaptador USB-C a Gigabit Ethernet RJ45", "TRIPP-LITE", "redes/adaptadores-ethernet/usb-gigabit/usb-c/tripp-lite-u436-06n-gb", "networking", {}],
  ["Microsoft CFQ7TTC0HD9ZP1YA NCEMMA260 Project Plan 5 Planner CSP anual", "MICROSOFT", "software/licencias/microsoft/project/planner-project-plan-5/csp-anual/cfq7ttc0hd9zp1ya", "software", {}],
  ["Panduit CFPE4IWY ACCPNT670 Mini-Com faceplate 4 puertos blanco mate", "PANDUIT", "redes/cableado-estructurado/placas-keystone/4-puertos/panduit-cfpe4iwy", "networking", {}],
  ["Acteck AC-940108 KB-1108 Inspire Trek TI747 teclado inalambrico 99 teclas Bluetooth 5.1", "ACTECK", "computo/perifericos/teclados/inalambricos/multidispositivo/98-teclas-rf-bluetooth/acteck-inspire-trek-ti747-ac-940108", "accessories", {}],
  ["Cisco C1200-24P-4G SWTCIS4570 Catalyst 1200 switch PoE+ 24 puertos Gigabit 4 SFP", "CISCO", "redes/switches/poe-administrables/gigabit/24-puertos/cisco-catalyst-c1200-24p-4g", "networking", {}],
  ["Canon PFI-110 Black CARCNN6650 2364C001AA tanque tinta imagePROGRAF 160ml", "CANON", "impresion/consumibles/cartuchos-tinta/canon/imageprograf-pfi-110/160ml/pfi-110bk-2364c001aa", "printers_scanners", {}],
  ["Quaroni QUM-03 RAM-3944 memoria USB metalica 64GB USB 2.0", "QUARONI", "computo/almacenamiento/memorias-flash/usb/64gb/usb-2-metalicas/quaroni-qum-03", "storage", {}],
  ["xFusion 0231YBFURR-XF SER-2443 2288H V7 servidor 2U Xeon Silver 4510 64GB DDR5", "X-FUSION", "computo/servidores/rack/2u/dual-socket/xfusion-2288h-v7-0231ybfurr-xf", "laptops", {}],
] as const;

const batch274Cases = [
  ["Intellinet 163682 ACCITL5500 PDU inteligente 1U rack 19 8 C13 16A UPC 766623163682", "INTELLINET", "energia/pdu-rack/inteligentes/1u-16a-8-c13/intellinet-163682", "power", {}],
  ["Balam Rush BR-931410 MOUBLR100 Helium GM980 mouse gaming alambrico USB 12000 DPI RGB", "BALAM RUSH", "computo/perifericos/mouse/gaming/alambricos-usb/12000-dpi/balam-rush-helium-gm980-br-931410", "gaming", {}],
  ["Xerox 106R02741 CARXRX5260 toner negro extra alta capacidad WorkCentre 3655 25900 paginas", "XEROX", "impresion/consumibles/toner-laser/xerox/workcentre-3655/106r02741-extra-alta-capacidad", "printers_scanners", {}],
  ["Hikvision DS-2CD2183G2-I CAMHKV3640 camara domo IP PoE 8MP AcuSense IR exterior", "HIKVISION", "seguridad/cctv/camaras-ip-poe/domo/8mp-acusense-ir/hikvision-ds-2cd2183g2-i", "cameras", {}],
  ["Epson C11CH38301 PR-2720 SureColor P700 impresora fotografica 13 pulgadas", "EPSON", "impresion/impresoras/inkjet-fotograficas/gran-formato/13-pulgadas/epson-surecolor-p700-c11ch38301", "printers_scanners", {}],
  ["BRobotix 764625 BOCRBT380 audifono aislador de ruido para iPhone 3.5mm gris", "BROBOTIX", "audio/audifonos/alambricos-3-5mm/in-ear-manos-libres/brobotix-764625-iphone-gris", "headphones", {}],
  ["Mercusys MR50G ROUMER130 router gigabit inalambrico doble banda AC1900", "MERCUSYS", "redes/routers/wifi-5/ac1900-gigabit/mercusys-mr50g", "networking", {}],
  ["HiLook THC-B120-MC CV-1769 camara bala TurboHD 2MP 103 grados IP66 IR 20m", "HIKVISION", "seguridad/cctv/camaras-turbohd/bullet/2mp-ir-exterior-ip66/hilook-thc-b120-mc", "cameras", {}],
  ["HPE Aruba Q9Y60AAE SWS-4640-CTO Central E-STU AP Foundation 60 meses", "HEWLETT PACKARD ENTERPRISE", "software/licencias/hpe-aruba/central/ap-foundation/5-anos/e-stu/q9y60aae", "software", {}],
  ["Hikvision NK42W0H-1T(WD)(D) KITHKV240 kit IP WiFi 4 camaras 2MP 1TB H.265", "HIKVISION", "seguridad/cctv/kits-videovigilancia/ip-wifi/4-canales-2mp-1tb/hikvision-nk42w0h-1t-wd-d", "cameras", {}],
] as const;

const batch275Cases = [
  ["CyberPower CRA50004 AC-11072 charola deslizable teclado rack 19 1U 500mm 20kg", "CYBERPOWER", "infraestructura/racks-accesorios/charolas/deslizables/1u-500mm-20kg/cyberpower-cra50004", "networking", {}],
  ["Yaber U12 PROYAB060 proyector smart 1080p 700 ANSI Dolby auto focus", "YABER", "video/proyectores/portatiles/1080p-smart/700-ansi/yaber-u12", "tvs", {}],
  ["Corsair HS80 RGB USB CA-9011237-NA SPK-2469 audifonos gaming 7.1 USB carbon", "CORSAIR", "audio/audifonos/usb/gaming-7-1/corsair-hs80-rgb-usb-ca-9011237-na", "headphones", {}],
  ["HPE H40J7E POL-6583 Tech Care Essential 5 anos ML350 Gen10 service", "HEWLETT PACKARD ENTERPRISE", "servicios-ti/soporte-garantias/hpe-tech-care/servidores/proliant-ml350-gen10/h40j7e-5y-essential", "software", {}],
  ["Silimex Sneakers Wipes 50 PZAS CN-4679 toallas humedas tenis 750300219683", "SILIMEX", "hogar/limpieza/calzado/toallas-humedas/silimex-sneakers-wipes-50", "accessories", {}],
  ["Norton 21443411 SOFNRT1740 Norton 360 Standard 1 dispositivo 1 ano espanol", "NORTON", "software/seguridad/antivirus/norton-360-standard/1-dispositivo-1-ano/21443411", "software", {}],
  ["Manhattan 325677 CABITL2070 CB-314 cable USB 2.0 A macho a Micro-B macho 0.5m", "MANHATTAN", "accesorios/cables-adaptadores/usb/usb-a-micro-b/2-0-0-5m/manhattan-325677", "accessories", {}],
  ["ESET TMESETL-360 SOFEST3360 PROTECT Entry On-Premise 3 anos endpoint", "ESET", "software/seguridad/endpoint/eset/protect-entry/on-premise/3-anos/tmesetl-360", "software", {}],
  ["Canon PFI-101MBK CARCNN2600 0882B001 tanque tinta mate negro imagePROGRAF 130ml", "CANON", "impresion/consumibles/cartuchos-tinta/canon/imageprograf-pfi-101/130ml/pfi-101mbk-0882b001", "printers_scanners", {}],
  ["Epson T157320 CAREPS4170 UltraChrome K3 157 cartucho Vivid Magenta R3000", "EPSON", "impresion/consumibles/cartuchos-tinta/epson/ultrachrome-k3/157/t157320-vivid-magenta", "printers_scanners", {}],
] as const;

const batch276Cases = [
  ["Lenovo Legion Tab Gen 3 TB321FU ZAEF0043MX NOT-10354 Snapdragon8 Gen3 8.8 2.5K", "LENOVO", "computo/tabletas/android/gaming/8-8-pulgadas/lenovo-legion-tab-gen-3-zaef0043mx", "tablets", {}],
  ["Epson T603C00 CAREPS1350 UltraChrome K3 Light Magenta 220 ml UPC 010343865594", "EPSON", "impresion/consumibles/cartuchos-tinta/epson/ultrachrome-k3/t603/t603c00-light-magenta", "printers_scanners", {}],
  ["Manhattan 355353 CABITL4570 CB-2772 HDMI premium 3.0m 4K60 18Gbps", "MANHATTAN", "accesorios/cables-adaptadores/video-hdmi/premium-4k60/3m/manhattan-355353", "accessories", {}],
  ["Dahua IPC-HFW2849M-S-B-PRO CAMDAH6770 camara IP bullet 8MP WizColor full color", "DAHUA TECHNOLOGY", "seguridad/cctv/camaras-ip-poe/bullet/8mp-full-color/dahua-ipc-hfw2849m-s-b-pro", "cameras", {}],
  ["Xbox Series S RRS-00001 XBOXMS540 512GB Robot White UPC 889842651317", "XBOX", "gaming/consolas/xbox/series-s/512gb/xbox-series-s-rrs-00001", "gaming", {}],
  ["Intel Core i9-12900 BX8071512900 CP-1287 12a Gen 16 cores UHD 770", "INTEL", "computo/componentes/procesadores/intel-core/core-i9/12a-gen/i9-12900-bx8071512900", "components", {}],
  ["Hikvision DS-1272ZJ-110-TRS ACCHKV4050 montaje pared domo exterior metal", "HIKVISION", "seguridad/cctv/accesorios-montaje/soportes-pared/domo/hikvision-ds-1272zj-110-trs", "cameras", {}],
  ["Uniview IPC2325LB-ADZK-H CAMUNV110 camara bullet IP PoE 5MP varifocal IR", "UNIVIEW", "seguridad/cctv/camaras-ip-poe/bullet/5mp-varifocal-ir/uniview-ipc2325lb-adzk-h", "cameras", {}],
  ["Hikvision DS-2CD2743G2-IZS CAMHKV3150 domo IP 4MP AcuSense varifocal 2.8-12mm", "HIKVISION", "seguridad/cctv/camaras-ip-poe/domo/4mp-acusense-varifocal/hikvision-ds-2cd2743g2-izs", "cameras", {}],
  ["Hikvision DS-2CD2D25G1/M-D/NF CV-1641 camara oculta IP 2MP pinhole 2.8mm", "HIKVISION", "seguridad/cctv/camaras-ip-poe/ocultas/2mp-pinhole/hikvision-ds-2cd2d25g1-m-d-nf", "cameras", {}],
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

  it.each(batch269Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch270Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch271Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch272Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch273Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch274Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch275Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });

  it.each(batch276Cases)("%s -> %s", (name, brand, path, legacyCategory, specs) => {
    const result = classifyManualCategory({ name, brand, category: "laptops", specs });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
