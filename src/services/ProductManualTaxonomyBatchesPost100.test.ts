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
] as const;

describe("manual taxonomy researched post-100 batches", () => {
  it.each(researchedBatchCases)("%s -> %s", (name, brand, path) => {
    expect(classifyManualCategory({ name, brand, category: "laptops" }).path).toBe(path);
  });
});
