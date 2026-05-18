# Provider Cycle Matrix

Este documento separa la cobertura del PoC ElectroPrice en dos niveles:

- **Full-cycle subshopping**: el proveedor declara capacidad `orders`, por lo que el
  PoC debe cubrir pago retail, OC/PO proveedor, pago mayorista, tracking, entrega,
  devolucion y reembolso.
- **Catalog-only/gated**: el proveedor puede aportar catalogo, precio, stock o
  contenido, pero no se promueve a compra automatica hasta completar spec
  transaccional en vhub o vimport.

## Full-cycle en PoC

Estos proveedores recorren el pipeline completo en `ProviderCycleMatrix.test.ts`:

- `commerceup_b2b`
- `ctonline`
- `cva`
- `dropi_mexico`
- `ingram_mexico`
- `intcomex_iws`
- `riqra_b2b`

## Catalog-only / provider gate

Estos proveedores quedan protegidos por compuerta transaccional:

- `syscom`
- `tecnosinergia`
- `compusoluciones_siclik`
- `exel_del_norte`
- `gcvexa`
- `pcdigital_mayoreo`
- `pch_mayoreo`
- `td_synnex_mexico`
- `tvc_enlinea`
- `wium_mayoristas`
- `zegucom`
- `mba3_wholesale`
- `expercom`
- `multivende`
- `stockeado`
- `ventiapp`
- `mexico_realtime_price_scheduler`

## Interpretacion

La matriz no afirma que todos los proveedores ya esten listos en produccion. Afirma
que el PoC:

- ejecuta el ciclo completo para todo proveedor que el catalogo declara con
  `orders`;
- evita compra automatica para proveedores sin contrato transaccional;
- mantiene visibilidad operativa con `Provider Gate` y `nextAction`;
- deja el camino claro para madurar cada proveedor agregando `orders`, tracking,
  invoice y returns en su spec vhub/vimport.
