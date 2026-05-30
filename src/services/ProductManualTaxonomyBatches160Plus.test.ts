import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch160PlusCases = [
  ["SanDisk Portable SSD SDSSDE30-1T00-G26 1TB USB-C USB 3.2 Gen 2 800 MB/s", "SANDISK", "computo/almacenamiento/ssd/externos/usb-c/1tb/sandisk-portable", "storage"],
  ["Balam Rush Power Rush V2 silla gamer tela piel sintetica reclinable 135 120kg", "BALAM RUSH", "gaming/mobiliario/sillas-gamer/tela/reclinable-135-120kg", "gaming"],
  ["TP-Link TL-WN781ND adaptador Wi-Fi PCI Express N150 150Mbps", "TP LINK", "redes/adaptadores-wifi/pcie/n150", "networking"],
  ["Huawei BE3 53030CSM router Wi-Fi 7 BE3600 3570Mbps 2.5G negro", "HUAWEI", "redes/routers/wifi-7/be3600", "networking"],
  ["PCM EBA7670 rollo autocopiante 76 x 70 mm blanco amarillo paquete 50", "PCM", "punto-de-venta/consumibles/rollos-autocopia/76x70", "laptops"],
  ["Perfect Choice ClearBeat PC-117025 audifonos Bluetooth TWS con display USB-C negros", "PERFECT CHOICE", "audio/audifonos/bluetooth/tws/estuche-display", "headphones"],
  ["Hikvision CAMHKV2610 camara bala 5MP TurboHD exterior metal techo pared", "HIKVISION", "seguridad/cctv/camaras-turbohd/bullet/5mp", "cameras"],
  ["ADATA XPG Spectrix D35G AX4U320016G16A-SBKD35G memoria RAM DDR4 16GB 3200MHz RGB", "ADATA", "computo/componentes/memoria-ram/udimm-ddr4/16gb-3200", "components"],
  ["Hyundai Hy View HT34CGMBK01 monitor gaming curvo 34 UWQHD 180Hz negro", "HYUNDAI", "computo/monitores/gaming/ultrawide-curvos/34-uwqhd-180hz", "monitors"],
  ["Stylos ST300 STMUS316B memoria USB 16GB gris", "STYLOS", "computo/almacenamiento/memorias-flash/usb/16gb", "storage"],
  ["Manhattan 353274 cable HDMI alta velocidad con Ethernet 7.5 m negro", "MANHATTAN", "accesorios/cables-adaptadores/video-hdmi/alta-velocidad/7-5m", "accessories"],
  ["Brother TN229Y toner amarillo rendimiento estandar 1200 paginas", "BROTHER", "impresion/consumibles/toner-laser/brother/tn-229/amarillo", "printers_scanners"],
  ["Lenovo ThinkVision T22i-30 63B0MAR6LA monitor 21.5 FHD IPS 60Hz", "LENOVO", "computo/monitores/oficina/22-fhd-60hz", "monitors"],
  ["Manhattan MW3050 190312 mouse inalambrico USB 1200 DPI negro", "MANHATTAN", "computo/perifericos/mouse/inalambricos/basicos/1200-dpi", "accessories"],
  ["Poly Studio V12 A9DD8AA#ABM barra de video USB 4K 20MP", "POLYCOM", "colaboracion/video-conferencia/barras-video/usb-4k", "accessories"],
  ["Provision ISR DMA-320IPEN-28-V4 camara domo IP PoE 2MP DDA2 microfono", "PROVISION-ISR", "seguridad/cctv/camaras-ip-poe/domo/2mp-analytics-mic", "cameras"],
  ["Stylos STMS321B memoria microSDHC 32GB clase 10 con adaptador", "STYLOS", "computo/almacenamiento/memorias-flash/microsd/32gb-clase-10", "storage"],
  ["Intellinet 715072 charola rack 19 pulgadas 1U 300mm 25kg negra", "INTELLINET", "infraestructura/racks-accesorios/charolas/1u-300mm-25kg", "networking"],
  ["Quaroni QD4S08G1 memoria RAM SO-DIMM DDR4 8GB 3200MHz CL22", "QUARONI", "computo/componentes/memoria-ram/sodimm-ddr4/8gb-3200", "components"],
  ["Logitech G923 TRUEFORCE volante y pedales racing PS5 PS4 PC", "LOGITECH", "gaming/accesorios/volantes-simulacion/trueforce", "gaming"],
  ["Nexxt Solutions Home NHE-S100 interruptor inteligente Wi-Fi monopolar blanco", "NEXXT SOLUTIONS HOME", "hogar/casa-inteligente/interruptores-wifi/monopolares", "accessories"],
  ["Manhattan 152082 tarjeta serial PCI Express 2 puertos DB9", "MANHATTAN", "computo/componentes/tarjetas-expansion/serial-pcie/db9-2-puertos", "components"],
  ["Kensington K55256WW MagPro filtro de privacidad magnetico para laptop 16 16:10", "KENSINGTON", "computo/accesorios/filtros-privacidad/laptops/16-16-10", "accessories"],
  ["Koblenz 9022 USB no break interactivo 900VA 450W LCD", "KOBLENZ", "energia/no-breaks-ups/line-interactive/900va/lcd", "power"],
  ["Polaroid PASU100-63 rollo papel sublimacion 100gsm 63in x 100m blanco", "POLAROID", "impresion/consumibles/papel-sublimacion/rollos/63in-100m-100gsm", "printers_scanners"],
  ["PCM 50000B0160A etiquetas transferencia termica 4x2 R-700 caja 12 rollos", "PCM", "impresion/consumibles/etiquetas-transferencia-termica/4x2/r-700-12-rollos", "printers_scanners"],
  ["Brother TN890 toner negro ultra alto rendimiento 20000 paginas", "BROTHER", "impresion/consumibles/toner-laser/brother/tn-890", "printers_scanners"],
  ["ADATA Premier Pro AUSDX128GUI3V30SA2-RA1 microSDXC 128GB UHS-I V30 A2 con adaptador", "ADATA", "computo/almacenamiento/memorias-flash/microsd/128gb-uhs-i-v30-a2", "storage"],
  ["Manhattan 371377 cable VGA SVGA HD15 macho macho 11m negro", "MANHATTAN", "accesorios/cables-adaptadores/video-vga/hd15/11m", "accessories"],
  ["Brother TZe-641 cinta laminada P-touch 18mm x 8m negro sobre amarillo", "BROTHER", "impresion/consumibles/cintas-etiquetas/brother-tze/laminadas/18mm/negro-sobre-amarillo", "printers_scanners"],
  ["Hyundai HYtab Plus 8WB1 HT8WB1RBK02A tablet 8 pulgadas Wi-Fi negra", "HYUNDAI", "computo/tabletas/android/8-pulgadas", "tablets"],
  ["Lenovo B210 4X40T84059 mochila para laptop 15.6 pulgadas negra", "LENOVO", "computo/accesorios/mochilas-fundas/mochilas-laptop/15-6", "accessories"],
  ["Brobotix 030570 cable extension USB-A 2.0 macho a hembra 4.9 m negro", "BROBOTIX", "accesorios/cables-adaptadores/usb/extensiones/5m", "accessories"],
  ["Mirati MSL02 cerradura inteligente Wi-Fi con huella RFID teclado y llave", "MIRATI", "seguridad/control-acceso/cerraduras-inteligentes/huella-rfid-wifi", "security"],
  ["GHIA Vector Plus GVPN tablet Android 13 10.1 pulgadas 4GB 64GB negra", "GHIA", "computo/tabletas/android/10-1-pulgadas", "tablets"],
  ["Intellinet 319874 patch cord Cat5e UTP RJ45 7.5 m azul", "INTELLINET", "redes/cableado-estructurado/patch-cords/cat5e/7-5m", "networking"],
  ["Stylos STPKTM3B combo teclado y mouse inalambrico USB negro 105 teclas", "STYLOS", "computo/perifericos/combos-teclado-mouse/inalambricos/basicos", "accessories"],
  ["Acteck Captive Brite CB195 AC-939409 monitor 19.5 pulgadas TN HD HDMI VGA negro", "ACTECK", "computo/monitores/oficina/19-5-hd", "monitors"],
  ["TP-Link LS108G switch no administrable Gigabit de 8 puertos", "TP LINK", "redes/switches/no-administrables/gigabit/8-puertos", "networking"],
  ["Getttech GAC-24404P mouse ergonomico inalambrico 2.4GHz 1600 DPI rosa", "GETTTECH", "computo/perifericos/mouse/inalambricos/ergonomicos/1600-dpi", "accessories"],
] as const;

describe("manual taxonomy batches 160 plus", () => {
  it.each(batch160PlusCases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
