# Subshopping Orchestrator

ElectroPrice EC usa vhub/vimport como producto transaccional, no solo como capa de datos. El caso de uso es que el cliente compra en el portal retail y el sistema crea las compras mayoristas necesarias, paga al proveedor, conserva trazabilidad y actualiza el pedido retail.

## Producto vimport requerido

El producto diferenciado es **Authorized Commerce Orchestrator**:

- vhub ejecuta APIs oficiales o specs `api_integrator`.
- vimport ejecuta portales autorizados cuando el proveedor no ofrece API suficiente.
- PocketBase conserva el estado retail, las ordenes de compra B2B y la bitacora.
- La UI muestra preview de sourcing en checkout y consola de operacion en Admin > Subshopping.

Esto no reemplaza los productos existentes de vimport:

- **Structured Data** sigue siendo la capa para catalogo, stock y precio.
- **Instant API** sigue exponiendo endpoints descubiertos o normalizados.
- **Ready APIs** sigue empaquetando proveedores recurrentes.
- **Authorized Commerce Orchestrator** agrega ejecucion transaccional: comprar, pagar, seguir y reconciliar.

## Flujo

1. El usuario final completa checkout retail.
2. ElectroPrice captura el pago retail.
3. `SubshoppingService` agrupa items por proveedor y crea POs B2B.
4. `ProviderRuntimeService` decide runtime:
   - `vhub/api` si el proveedor tiene API de ordenes.
   - `vimport/portal_fallback` si hay portal automatizable con autorizacion.
   - `manual` si falta onboarding o spec transaccional.
5. `PaymentService.payWholesalerPurchaseOrder` registra pago proveedor.
6. La orden se persiste con `purchase_orders`, `subshopping_status` y `fulfillment_timeline`.
7. La UI de pedido y el dashboard admin muestran trazabilidad por proveedor.

## Contrato de datos

Cada orden retail puede incluir:

- `subshopping_status`: Planning, Purchasing, Awaiting Provider, Tracking, Completed, Exception.
- `purchase_orders`: arreglo de POs por proveedor, runtime, canal, estado, pago, tracking y acciones siguientes.
- `fulfillment_timeline`: bitacora auditable con actor, fecha, detalle y severidad.

## Criterios de aceptacion

- Un checkout con productos de varios proveedores crea multiples POs.
- Un proveedor con API de ordenes queda en `vhub/api`.
- Un proveedor sin orden transaccional queda en compuerta, sin fingir automatizacion.
- El admin puede ver costos, pagos, compuertas, runtime y tracking.
- El usuario ve una trazabilidad comprensible en su pedido.

## Siguiente madurez

- Conectar `VITE_SUBSHOPPING_LIVE_RUNTIME=true` a endpoints reales de vhub/vimport.
- Agregar reconciliacion de facturas, reintentos y cancelaciones parciales.
- Integrar paybank-v como vault/tokenizacion server-side para pagos mayoristas.
- Crear jobs de seguimiento por proveedor para actualizar tracking y ETA.
