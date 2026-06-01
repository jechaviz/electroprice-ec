import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch238Cases = [
  ["Pasta termica Game Factor TP200 4 g gris 5.15 W/mK aplicador ACCVGO2200", "GAME FACTOR", "computo/componentes/enfriamiento/pasta-termica/game-factor-tp200-4g", "components"],
  ["Cera para contar Cuenta Facil Azor 301.64 envase 14 g ACCAZR720", "AZOR", "oficina/equipo-oficina/manejo-efectivo/cera-para-contar/azor-301-64", "accessories"],
  ["Instalacion y configuracion servidor virtual CT Cloud IIIS IIS SERCLO570", "CT CLOUD", "software/servicios-nube/ct-cloud/configuracion-servidores/iis-servidor-virtual/iiis", "software"],
  ["Instalacion VPN Cliente Servidor CT Cloud VPNCS SERCLO580", "CT CLOUD", "software/servicios-nube/ct-cloud/redes-vpn/cliente-servidor/vpncs", "software"],
  ["Certificado SSL CT Cloud CSSLSTD standard SERCLO600", "CT CLOUD", "software/servicios-nube/ct-cloud/seguridad-web/certificados-ssl/standard/csslstd", "software"],
  ["Certificado SSL CT Cloud CSSLWDCD wildcard SERCLO610", "CT CLOUD", "software/servicios-nube/ct-cloud/seguridad-web/certificados-ssl/wildcard/csslwdcd", "software"],
  ["Separador Wilson Jones P1366 31 divisiones carta ACCACO020", "WILSON JONES", "oficina/papeleria/archivo/separadores-indices/carta/numericos/31-divisiones/wilson-jones-p1366", "accessories"],
  ["Separador Wilson Jones P1348 12 divisiones carta ACCACO010", "WILSON JONES", "oficina/papeleria/archivo/separadores-indices/carta/numericos/12-divisiones/wilson-jones-p1348", "accessories"],
  ["Cartulina Iris Euromac EI0042 negro 50 x 65 cm 10 pliegos ACCIRI010", "EUROMAC", "oficina/papeleria/papel-cartulina/cartulina-iris/50x65/negro-10-pliegos/euromac-ei0042", "accessories"],
  ["Marcador Uni Paint PX20OR oro base aceite punta mediana ACCAZR820", "UNI PAINT", "oficina/papeleria/marcadores/permanentes/industriales/base-aceite/uni-paint-px20-oro", "accessories"],
] as const;

describe("manual taxonomy batches 238 plus", () => {
  it.each(batch238Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
