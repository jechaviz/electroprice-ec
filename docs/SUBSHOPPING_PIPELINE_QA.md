# Subshopping Pipeline QA

Este playbook valida la cadena completa del producto Authorized Commerce Orchestrator
sin dinero real ni credenciales productivas.

## Tarjetas sandbox modeladas

Las tarjetas de prueba se exponen desde `PaymentService.getSandboxCards()` para que
el checkout local pueda alternar escenarios:

- `stripe_visa_success_mx`: Visa Mexico aprobada.
- `paypal_3ds_success_mx`: PayPal 3DS Mexico aprobado.
- `stripe_insufficient_funds`: rechazo por fondos insuficientes.

Fuentes oficiales consultadas:

- Stripe Testing: https://docs.stripe.com/testing. Las tarjetas de prueba no mueven fondos y deben usarse con llaves
  de prueba; incluye Visa global, Mexico y escenarios de rechazo/refund.
- PayPal 3D Secure Test Scenarios: https://developer.paypal.com/docs/checkout/advanced/customize/3d-secure/test/. Sandbox para simular compra y respuestas 3DS,
  incluyendo Mexico.

## Pipeline esperado

1. El cliente selecciona tarjeta sandbox en checkout.
2. `PaymentService.processRetailPayment` crea y confirma el pago retail.
3. `SubshoppingService.startWorkflow` agrupa items por proveedor.
4. `ProviderRuntimeService` decide vhub, vimport o compuerta manual.
5. Se pagan POs mayoristas con `payWholesalerPurchaseOrder`.
6. `OrderLifecycleService.advanceProviderShipment` registra tracking proveedor.
7. `OrderLifecycleService.confirmDelivery` confirma entrega al cliente.
8. `OrderLifecycleService.requestReturn` abre postventa.
9. `OrderLifecycleService.completeRefund` emite reembolso sandbox.

## Pruebas automatizadas

- `src/services/PaymentService.test.ts`: pago aprobado y tarjeta rechazada.
- `src/services/SubshoppingPipeline.test.ts`: cadena completa de compra, PO,
  entrega, devolucion y reembolso.
- `src/services/SubshoppingService.test.ts`: agrupacion y workflow B2B.
- `src/services/ProviderRuntimeService.test.ts`: runtime/compuertas por proveedor.

Ejecutar:

```bash
npm run test:run -- src/services/PaymentService.test.ts src/services/SubshoppingPipeline.test.ts
```

## Criterio de aceptacion

La prueba no se considera completa si solo crea el pedido. Debe demostrar:

- Pago retail exitoso o rechazado de forma determinista.
- Una o mas OCs mayoristas con pago proveedor.
- Tracking visible para cliente.
- Confirmacion de entrega.
- Solicitud de devolucion.
- Reembolso sandbox y cierre en estado `Returned`.
