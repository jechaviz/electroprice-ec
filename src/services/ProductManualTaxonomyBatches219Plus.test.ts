import { describe, expect, it } from "vitest";
import { classifyManualCategory } from "../../pb/lib/manualTaxonomy.mjs";

const batch219Cases = [
  ["Azor 30655 Signal Fashion marcador permanente estuche 5 piezas ACCAZR450", "AZOR", "oficina/papeleria/marcadores/permanentes/signal-fashion/surtidos/5-piezas/azor-30655", "accessories"],
  ["Forza FVP-1201B Zion-2K10 protector voltaje 900J 1800W AC-12450", "FORZA", "energia/supresores-reguladores/protectores-voltaje/120v/1-contacto/forza-fvp-1201b", "power"],
  ["Canon imageFORMULA DR-C230 2646C003 escaner documental ADF duplex SCACNN550", "CANON", "impresion/escaneres/documentales/adf/duplex/a4/canon-imageformula-dr-c230-2646c003", "printers_scanners"],
  ["Ingressio IngSfwNubePyme1yr servicio en la nube PyME 50 empleados", "INGRESSIO", "software/recursos-humanos/control-asistencia/ingressio-nube/pyme-50-empleados-1y", "software"],
  ["GEO 027 caja de archivo plastico tamano oficio ACCGEO040", "GEO", "oficina/papeleria/archivo/cajas-archivo/oficio/plastico/geo-027", "accessories"],
  ["Azor 8350RO marcador Magistral Didactico rojo pizarron blanco caja 12", "AZOR", "oficina/papeleria/marcadores/pizarron-blanco/magistral-didactico/rojo/12-piezas/azor-8350ro", "accessories"],
  ["BenQ InstaShow WDC15 sistema presentacion inalambrica 4K ACCBNQ790", "BENQ", "computo/colaboracion/presentacion-inalambrica/benq-instashow/wdc15", "desktops"],
  ["Dell 452-BDVB soporte VESA OptiPlex Micro Thin Client AC-11241", "DELL", "computo/accesorios/soportes-monitor/vesa/mini-pc/dell-452-bdvb", "accessories"],
  ["Lenovo 5WS0K75663 garantia Depot CCI 3Y IdeaPad POL-8042", "LENOVO", "servicios-ti/soporte-garantias/lenovo/depot-cci/ideapad/3y/5ws0k75663", "software"],
  ["Enson ENS-DC12 distribuidor pulpo 1 a 2 canales CCTV ACCMVA1140", "ENSON", "seguridad/cctv/accesorios-alimentacion/distribuidores-dc/1-a-2/enson-ens-dc12", "cameras"],
] as const;

describe("manual taxonomy batches 219 plus", () => {
  it.each(batch219Cases)("%s -> %s", (name, brand, path, legacyCategory) => {
    const result = classifyManualCategory({ name, brand, category: "laptops" });
    expect(result.path).toBe(path);
    expect(result.legacyCategory).toBe(legacyCategory);
  });
});
