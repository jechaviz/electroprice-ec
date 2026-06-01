import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch254Cases = [
  ["Bocina Creative MUVO Play MF8365 BK negra 10W IPX7 BOCCRT160", "CREATIVE", "audio/bocinas/bluetooth/portatiles/ipx7-10w/creative-muvo-play/negro", "audio"],
  ["Bocina Creative MUVO Play MF8365 BU azul 10W IPX7 BOCCRT170", "CREATIVE", "audio/bocinas/bluetooth/portatiles/ipx7-10w/creative-muvo-play/azul", "audio"],
  ["Bocina Creative MUVO Go MF8405 BK negra 20W IPX7 BOCCRT180", "CREATIVE", "audio/bocinas/bluetooth/portatiles/ipx7-20w/creative-muvo-go/negro", "audio"],
  ["Papel bond DIEM Premium 7506231550947 carta 75g 99 blancura caja 5000 hojas", "DIEM", "oficina/papel-consumibles/papel-bond/carta/5000-hojas/diem-premium-75g-99-blancura", "accessories"],
  ["Canon imageRUNNER ADVANCE DX 4945i multifuncional laser monocromatica COPCNN590", "CANON", "impresion/impresoras/multifuncionales-laser/monocromaticas/canon-imagerunner-advance-dx-4945i", "printers_scanners"],
  ["Barra de sonido Getttech GUS-MSRBT-01 Bluetooth RGB 6W AUDGET010", "GETTTECH", "audio/barras-sonido/pc/compactas-rgb/getttech-gus-msrbt-01", "audio"],
  ["Diadema gamer Corsair HS65 Wireless V2 blanca CA-9011286-NA2 BOCCOR480", "CORSAIR", "audio/audifonos/diadema/gaming/inalambricos/2-4ghz-bluetooth/corsair-hs65-wireless-white", "headphones"],
  ["Diadema gamer Corsair HS65 Wireless V2 Carbon CA-9011285-NA2 BOCCOR470", "CORSAIR", "audio/audifonos/diadema/gaming/inalambricos/2-4ghz-bluetooth/corsair-hs65-wireless-carbon", "headphones"],
  ["Clip retenedor Cisco C9K-CMPCT-PWR-CLP Catalyst 9200CX ACCCIS1710", "CISCO", "redes/accesorios/cables-de-alimentacion/retenedores/cisco-c9k-cmpct-pwr-clp", "networking"],
  ["Pulsera inteligente Xiaomi Smart Band 8 negro BHR7165G ACCXIA020", "XIAOMI", "electronica/wearables/pulseras-inteligentes/xiaomi-smart-band-8-negro-bhr7165g", "accessories"],
] as const;

describe("manual taxonomy batches 254 plus", () => {
  it.each(batch254Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
