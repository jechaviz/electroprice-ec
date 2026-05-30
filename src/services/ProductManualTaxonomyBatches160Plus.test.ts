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
] as const;

describe("manual taxonomy batches 160 plus", () => {
  it.each(batch160PlusCases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
