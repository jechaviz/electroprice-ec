import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch160Cases = [
  ["SanDisk Portable SSD SDSSDE30-1T00-G26 1TB USB-C USB 3.2 Gen 2 800 MB/s", "SANDISK", "computo/almacenamiento/ssd/externos/usb-c/1tb/sandisk-portable"],
  ["Balam Rush Power Rush V2 silla gamer tela piel sintetica reclinable 135 120kg", "BALAM RUSH", "gaming/mobiliario/sillas-gamer/tela/reclinable-135-120kg"],
  ["TP-Link TL-WN781ND adaptador Wi-Fi PCI Express N150 150Mbps", "TP LINK", "redes/adaptadores-wifi/pcie/n150"],
  ["Huawei BE3 53030CSM router Wi-Fi 7 BE3600 3570Mbps 2.5G negro", "HUAWEI", "redes/routers/wifi-7/be3600"],
  ["PCM EBA7670 rollo autocopiante 76 x 70 mm blanco amarillo paquete 50", "PCM", "punto-de-venta/consumibles/rollos-autocopia/76x70"],
  ["Perfect Choice ClearBeat PC-117025 audifonos Bluetooth TWS con display USB-C negros", "PERFECT CHOICE", "audio/audifonos/bluetooth/tws/estuche-display"],
  ["Hikvision CAMHKV2610 camara bala 5MP TurboHD exterior metal techo pared", "HIKVISION", "seguridad/cctv/camaras-turbohd/bullet/5mp"],
  ["ADATA XPG Spectrix D35G AX4U320016G16A-SBKD35G memoria RAM DDR4 16GB 3200MHz RGB", "ADATA", "computo/componentes/memoria-ram/udimm-ddr4/16gb-3200"],
  ["Hyundai Hy View HT34CGMBK01 monitor gaming curvo 34 UWQHD 180Hz negro", "HYUNDAI", "computo/monitores/gaming/ultrawide-curvos/34-uwqhd-180hz"],
  ["Stylos ST300 STMUS316B memoria USB 16GB gris", "STYLOS", "computo/almacenamiento/memorias-flash/usb/16gb"],
] as const;

describe("manual taxonomy batch 160", () => {
  it.each(batch160Cases)("%s -> %s", (name, brand, path) => {
    expect(classifyManualCategory({ name, brand, category: "laptops" }).path).toBe(path);
  });
});
