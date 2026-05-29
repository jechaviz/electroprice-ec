import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const researchedBatchCases = [
  ["Naceb Technology NA-0310R audifonos tipo diadema con microfono 3.5 mm rojo negro", "NACEB TECHNOLOGY", "audio/audifonos/alambricos-3-5mm/diadema-con-microfono"],
  ["Streamax ADPLUS 2.0-V1.1 MDVR dashcam vehicular 4G GPS Wi-Fi MOD4AMER33", "STREAMAX", "seguridad/cctv/camaras-moviles/mdvr/4g-gps"],
  ["Acteck TE-200 teclado estandar alambrico USB negro AC-928946", "ACTECK", "computo/perifericos/teclados/alambricos/usb"],
  ["Dell Pro 14 Plus laptop 14 pulgadas Core Ultra 7 266V 16GB Windows 11 Pro", "DELL", "computo/laptops/empresariales/14-pulgadas/dell-pro-14-plus"],
  ["Ocelot Gaming OMPXL01 mouse pad de tela extendido RGB con software", "OCELOT GAMING", "computo/accesorios/mousepads/gaming-rgb/extendidos"],
  ["Hisense ART121KAW minisplit inverter 1 tonelada 11500 BTU solo frio Wi-Fi", "HISENSE", "hogar/electrodomesticos/aires-acondicionados/minisplit/1-tonelada"],
  ["Hisense 40A45NV Smart TV LED 40 pulgadas Full HD VIDAA Wi-Fi", "HISENSE", "video/televisores/led-vidaa-tv/40-fhd"],
  ["Perfect Choice PC-085010 bolso crossbody para tablet 10.8 pulgadas azul", "PERFECT CHOICE", "computo/accesorios/mochilas-fundas/maletines-tablet/10-8-pulgadas"],
  ["TP-Link Omada ER605 router VPN Gigabit Multi-WAN SDN", "TP-LINK", "redes/routers/vpn/omada/er605"],
  ["Balam Rush GR Burst GR750G fuente ATX 750W 80 Plus Gold full modular", "BALAM RUSH", "computo/componentes/fuentes-poder/atx-80-plus-gold/750w"],
  ["Dahua DHI-USB-U106-20-16GB USB 2.0 Flash Drive 16GB MEMNCB020", "DAHUA TECHNOLOGY", "computo/almacenamiento/memorias-flash/usb/16gb/metalicas"],
  ["Dahua DH-PFM800-E balun pasivo HDCVI 1080p ACCDAH650", "DAHUA TECHNOLOGY", "seguridad/cctv/accesorios-cableado/baluns-video/hdcvi-1080p"],
  ["Dahua DHI-USB-U106-20-8GB USB 2.0 Flash Drive 8GB MEMNCB010", "DAHUA TECHNOLOGY", "computo/almacenamiento/memorias-flash/usb/8gb/metalicas"],
  ["TP-Link TL-WR840N router Wi-Fi N300 2.4GHz ROUTPL560", "TP-LINK", "redes/routers/wifi-n/n300"],
  ["Dahua DH-PFM979-1S4P divisor alimentacion DC 1 a 4 CCTV", "DAHUA TECHNOLOGY", "seguridad/cctv/accesorios-cableado/conectores-corriente/divisores-energia-dc"],
  ["Brother BT5001Y botella tinta amarilla 48.8 ml 5000 paginas", "BROTHER", "impresion/consumibles/botellas-tinta/brother-bt5001/amarillo"],
  ["Logitech M90 910-004053 mouse USB alambrico 1000 DPI negro", "LOGITECH", "computo/perifericos/mouse/alambricos/basicos/1000-dpi"],
  ["Stylos ST100 STMUSB2B memoria USB 16GB USB 2.0 plata", "STYLOS", "computo/almacenamiento/memorias-flash/usb/16gb/metalicas"],
  ["Epson T504420-AL botella tinta amarilla 504 EcoTank 70 ml", "EPSON", "impresion/consumibles/botellas-tinta-ecotank/epson-t504/amarillo"],
  ["TP-Link TL-WA850RE extensor Wi-Fi N300 2.4GHz", "TP-LINK", "redes/extensores-wifi/n300"],
] as const;

describe("manual taxonomy researched post-100 batches", () => {
  it.each(researchedBatchCases)("%s -> %s", (name, brand, path) => {
    expect(classifyManualCategory({ name, brand, category: "laptops" }).path).toBe(path);
  });
});
