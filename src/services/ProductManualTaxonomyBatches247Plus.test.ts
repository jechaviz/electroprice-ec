import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch247Cases = [
  ["Caja de mantenimiento Epson SJMB4000 C33S021601 para CW-C4000 CN-4672", "EPSON", "impresion/consumibles/cajas-mantenimiento/epson-colorworks/c33s021601", "printers_scanners"],
  ["Punto de acceso Cisco Catalyst C9115AXI-A Wi-Fi 6 ACPCIS880 UPC 889728211741", "CISCO", "redes/access-points/wifi-6/techo/cisco-catalyst-9115axi-a", "networking"],
  ["Aire acondicionado minisplit LG MV182C4 17000 BTU solo frio 230V AIRLGE510", "LG", "climatizacion/aires-acondicionados/minisplit/estandar/18000-btu/solo-frio-230v/lg-mv182c4", "accessories"],
  ["Smartwatch Amazfit GTR 3 gris luna GPS ACCAMZ200 UPC 850030107299", "Amazfit", "electronica/wearables/smartwatches/gps/amazfit-gtr-3", "accessories"],
  ["Smartwatch Amazfit GTS 3 blanco marfil GPS ACCAMZ350 UPC 850030107312", "Amazfit", "electronica/wearables/smartwatches/gps/amazfit-gts-3", "accessories"],
  ["Pulsera inteligente Amazfit Band 5 verde ACCAMZ290 UPC 850015911859", "Amazfit", "electronica/wearables/pulseras-inteligentes/amazfit-band-5", "accessories"],
  ["Auriculares Gaming Corsair HS55 Surround Carbon CA-9011265-NA BOCCOR400", "CORSAIR", "audio/audifonos/diadema/gaming/alambricos/3-5mm-usb/corsair-hs55-surround-carbon", "headphones"],
  ["Auriculares gaming Corsair HS55 White CA-9011271-NA BOCCOR420 UPC 840006643838", "CORSAIR", "audio/audifonos/diadema/gaming/alambricos/3-5mm-usb/corsair-hs65-surround-white", "headphones"],
  ["Smartwatch Stylos STSWM3D dorado bluetooth resistente al agua ACCSTY390", "Stylos", "electronica/wearables/smartwatches/stylos-stswm3d", "accessories"],
  ["Mini contacto TP-Link Tapo P105(1-Pack) inteligente SH-50", "TP LINK", "domotica/contactos-inteligentes/wifi/tp-link-tapo-p105-1-pack", "accessories"],
] as const;

describe("manual taxonomy batches 247 plus", () => {
  it.each(batch247Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
