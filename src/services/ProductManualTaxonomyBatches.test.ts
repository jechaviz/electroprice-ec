import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const researchedBatchCases = [
  ["Dbugg DB-PD64 cargador de pared USB-C PD GaN 67W", "DBUGG", "energia/cargadores-usb"],
  ["Fujitsu fi-70F escaner plano A6 USB", "FUJITSU", "impresion/escaneres"],
  ["Perfect Choice PC-085058 bolso cruzado Holdi negro", "PERFECT CHOICE", "oficina/mochilas-bolsas"],
  ["Creative Sound Blaster GS5 barra de sonido compacta", "CREATIVE", "audio/barras-sonido"],
  ["Game Factor HSG500 headset gamer USB 7.1 RGB", "GAME FACTOR", "audio/audifonos"],
  ["Huawei M-Pencil CD54-S1 lapiz optico blanco", "HUAWEI", "computo/accesorios/stylus-tablets"],
  ["Perfect Choice PC-085249 mochila escolar Bookery purpura", "PERFECT CHOICE", "oficina/mochilas-bolsas"],
  ["HP GT52 3YP17AL botella de tinta amarilla 70 ml", "HP", "impresion/consumibles/tinta-toner"],
  ["Perfect Choice PC-084433 mochila escolar Delfin Astro", "PERFECT CHOICE", "oficina/mochilas-bolsas"],
  ["Duosmart E21 camara inteligente WiFi 3MP PIR", "DUOSMART", "seguridad/cctv/camaras-ip-wifi"],
  ["KSA GKSA01-B goggles de proteccion anti empanante", "KSA", "seguridad/epp/proteccion-ocular"],
  ["TopVision TBDL200A camara HD bullet 2MP TVI AHD CVI", "TOPVISION", "seguridad/cctv/camaras-turbohd"],
  ["Laces LA100KSP kit de soportes de pared para rack", "LACES", "infraestructura/racks-accesorios/soportes-pared"],
  ["Logitech PRO X 60 920-011921 teclado gaming wireless", "LOGITECH", "computo/perifericos/teclados"],
  ["Dell PowerEdge R470 R470271 servidor rack 1U", "DELL", "computo/servidores/rack"],
  ["TechZone TZLBP02 mochila laptop 15.6 pulgadas", "TECHZONE", "computo/accesorios/mochilas-fundas"],
  ["Nexxt AW222NXT67 NPS-V11U3B charola para rack 1U", "NEXXT", "infraestructura/racks-accesorios/charolas"],
  ["Vorago KSP-205 mini bafle karaoke bluetooth RGB", "VORAGO", "audio/bocinas"],
  ["Syble XB-VP1106 verificador de precios POS", "SYBLE", "punto-de-venta/verificadores-precio"],
  ["Perfect Choice PC-085027 bolso cruzado Holdy avellana", "PERFECT CHOICE", "oficina/mochilas-bolsas"],
  ["Perfect Choice PC-085294 mochila escolar Kiddo Corazon", "PERFECT CHOICE", "oficina/mochilas-bolsas"],
  ["Pacific Soft PSF030 punto de venta para farmacias", "PACIFIC SOFT", "punto-de-venta/software-pos"],
  ["Redragon Sacarab White A130W-SP keycaps PBT", "REDRAGON", "computo/perifericos/teclados/keycaps"],
  ["TP-Link Omada OC200 controlador cloud", "OMADA", "redes/controladores-cloud"],
  ["North System NORTH109-BKL organizador horizontal rack", "NORTH SYSTEM", "infraestructura/racks-accesorios/organizadores-cable"],
  ["Vorago BSP-400 Pool Bluetooth IPX67 bocina", "VORAGO", "audio/bocinas"],
  ["PCM 10B13 papel bond plotter 0.61 x 50", "PCM", "impresion/consumibles/papel-plotter"],
  ["Necnon NPW-10FC power bank 10000 mAh", "NECNON", "energia/power-banks"],
  ["Huawei 55037722 M-Pen Lite AF63-R lapiz optico", "HUAWEI", "computo/accesorios/stylus-tablets"],
  ["Perfect Choice PC-084730 Sportiva bolso deportivo", "PERFECT CHOICE", "oficina/mochilas-bolsas"],
  ["Vorago KSP-180 mini bafle karaoke bluetooth RGB", "VORAGO", "audio/bocinas"],
  ["Perfect Choice PC-270157 smartwatch Mercury negro", "PERFECT CHOICE", "wearables/smartwatches"],
  ["Perfect Choice PC-270218 smartwatch Minoro llamadas", "PERFECT CHOICE", "wearables/smartwatches"],
  ["Nexxt AW222NXT66 NPS-S11U3B charola lisa rack", "NEXXT", "infraestructura/racks-accesorios/charolas"],
  ["TopVision TDDL500A camara HD turret 5MP", "TOPVISION", "seguridad/cctv/camaras-turbohd"],
  ["Meriva MDL-3202A camara HD turret 2MP", "MERIVA", "seguridad/cctv/camaras-turbohd"],
  ["Vorago KSP-350 bocina bluetooth 30W", "VORAGO", "audio/bocinas"],
  ["Redragon Sacarab Pink A130P-SP keycaps PBT", "REDRAGON", "computo/perifericos/teclados/keycaps"],
  ["Verbatim 95310 DVD+R DL 8.5GB 20 pack", "VERBATIM", "computo/almacenamiento/medios-opticos"],
  ["Fujitsu ScanSnap SV600 escaner elevado A3", "FUJITSU", "impresion/escaneres"],
] as const;

describe("manual taxonomy researched batches", () => {
  it.each(researchedBatchCases)("%s -> %s", (name, brand, path) => {
    expect(classifyManualCategory({ name, brand, category: "laptops" }).path).toBe(path);
  });
});
