import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch290Cases = [
  ["CyberPower OLS10K2UXSTF FR-2171 transformador reductor UPS 10kVA 10kW 2U", "CYBERPOWER", "energia/no-breaks-ups/accesorios/transformadores-reductores/10kva/cyberpower-ols10k2uxstf", "power"],
  ["Ghia GLUV1 AC-7923 lampara UV detectora de billetes falsos 9W", "GHIA", "punto-de-venta/detectores-billetes/uv-lupa/ghia-gluv1", "accessories"],
  ["Synology RX1225RP SERTRD1390 unidad expansion rack 2U 12 bahias fuente redundante", "SYNOLOGY", "computo/almacenamiento/nas/rack/expansion-units/12-bahias/synology-rx1225rp", "storage"],
  ["HP ScanJet Enterprise Flow N9000 sn1 SCAHPI550 escaner documental ADF A3 80 ppm", "HP", "impresion/escaneres/documentales/produccion/adf/a3/hp-scanjet-enterprise-flow-n9000-sn1", "printers_scanners"],
  ["Peerless-AV AEC0305 AC-9774 columna de extension ajustable 3 a 5 pies 500 lb", "PEERLESS-AV", "accesorios/montaje-soportes/audio-video/columnas-extension/ajustables-3-5ft/peerless-aec0305", "accessories"],
  ["Logitech RoomMate 950-000081 AC-11426 appliance CollabOS para salas de reunion", "LOGITECH", "computo/colaboracion/salas-reunion/appliances-collabos/logitech-roommate-950-000081", "desktops"],
  ["QNAP QXG-25G2SF-CX6 NIC-4269 tarjeta PCIe dual SFP28 25GbE ConnectX-6", "QNAP", "redes/tarjetas-red/pcie/25gbe-dual-sfp28/qnap-qxg-25g2sf-cx6", "networking"],
  ["EZVIZ CS-L2S AC-13001 cerradura inteligente Zigbee huella RFID codigo tarjetas", "EZVIZ", "seguridad/control-acceso/cerraduras-inteligentes/huella-rfid-zigbee/ezviz-cs-l2s", "security"],
  ["CyberPower PDU81006 AC-12303 PDU inteligente 1U L6-20P 8 IEC C13 outlet metered", "CYBERPOWER", "energia/pdu-rack/inteligentes/1u-16a-8-c13/cyberpower-pdu81006", "power"],
  ["Soft Restaurant SR-12LITE-RE KITNTS4380 12 Lite renta mensual 2 nodos software POS", "SOFT RESTAURANT", "punto-de-venta/software-pos/restaurantes/licencias-renta-mensual/soft-restaurant-12-lite-2-nodos/sr-12lite-re", "software"],
] as const;

describe("manual taxonomy batch 290", () => {
  it.each(batch290Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
