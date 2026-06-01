import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch244Cases = [
  ["Teltonika TMT250 rastreador GPS personal 2G GNSS Bluetooth IP67 RASTEL010", "TELTONIKA", "electronica/localizadores-gps/rastreadores-personales/seguridad-personal/teltonika-tmt250", "security"],
  ["Canon BH-10 GI-10 PGBK kit cabezal tinta 3418C005AA CARCNN6720", "CANON", "impresion/consumibles/cabezales/canon-pixma-megatank/canon-bh-10-gi-10-pgbk", "printers_scanners"],
  ["Canon PH-S GI-16 BK C M Y kit cabezal MAXIFY GX6010 4659C005AA 660685231009", "CANON", "impresion/consumibles/cabezales/canon-maxify-gx/ph-s-gi-16-kit", "printers_scanners"],
  ["Eaton Tripp Lite SU6000XFMR2U transformador aislamiento 6kVA TRNTRL010", "EATON TRIPP LITE", "energia/no-breaks-ups/accesorios/transformadores-aislamiento-reductores/6kva/tripp-lite-su6000xfmr2u", "power"],
  ["Perforadora Pegaso 333 metalica gris 3 orificios ACCAZR650", "PEGASO", "oficina/equipo-oficina/perforadoras/3-orificios/pegaso-333", "accessories"],
  ["Plastilina BACO PL012 marqueta 180 g blanca No 60 ACCBAC3660", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/blanco/baco-pl012", "accessories"],
  ["Plastilina BACO PL004 marqueta 180 g naranja No 52 ACCBAC3720", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/naranja/baco-pl004", "accessories"],
  ["Plastilina BACO PL043 marqueta 180 g amarillo pastel ACCBAC3730", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/amarillo-pastel/baco-pl043", "accessories"],
  ["Plastilina BACO PL010 marqueta 180 g cafe No 58 ACCBAC3670", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/cafe/baco-pl010", "accessories"],
  ["Plastilina BACO PL014 marqueta 180 g verde oscuro No 62 ACCBAC4050", "BACO", "oficina/papeleria/material-escolar/plastilina/marqueta-180g/verde-oscuro/baco-pl014", "accessories"],
] as const;

describe("manual taxonomy batches 244 plus", () => {
  it.each(batch244Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
