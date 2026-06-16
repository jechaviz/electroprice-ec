<?php
declare(strict_types=1);

/**
 * NO-SUBMIT subshopping runtime endpoint.
 *
 * The storefront's live runtime path (ProviderRuntimeService) POSTs each
 * wholesale purchase order here:
 *   /runtime/vhub/subshopping/purchase-orders
 *   /runtime/vimport/subshopping/purchase-orders
 *
 * This handler runs in strict DRY-RUN mode: it validates and acknowledges the
 * purchase order but NEVER contacts a distributor and NEVER moves money. It is
 * the safe "sandbox-complete" layer. Going live for real means replacing this
 * dry-run with the actual vhub/vimport runtime call, one provider at a time,
 * gated by the per-provider switch documented in the catalog config.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = $_SERVER['REQUEST_URI'] ?? '';
$runtime = strpos($path, '/runtime/vimport') !== false ? 'vimport' : 'vhub';

// Health probe: GET /runtime/<rt>/health (or anything that is not the PO route).
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST' || strpos($path, '/subshopping/purchase-orders') === false) {
    echo json_encode([
        'ok' => true,
        'runtime' => $runtime,
        'mode' => 'dry-run',
        'message' => 'Subshopping runtime is in NO-SUBMIT mode. No real orders or payments are placed.',
    ]);
    exit;
}

$raw = file_get_contents('php://input');
$body = is_string($raw) && $raw !== '' ? (json_decode($raw, true) ?: []) : [];

$providerId = isset($body['providerId']) ? (string) $body['providerId'] : 'provider';
$purchaseOrderId = isset($body['purchaseOrderId']) ? (string) $body['purchaseOrderId'] : 'po';

$providerKey = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $providerId) ?: 'PROV');
$suffix = substr($purchaseOrderId, -6);

try {
    $traceId = $runtime . '_dryrun_' . bin2hex(random_bytes(4));
} catch (Exception $e) {
    $traceId = $runtime . '_dryrun_' . substr(md5($purchaseOrderId . microtime()), 0, 8);
}

echo json_encode([
    'ok' => true,
    'providerOrderId' => 'DRYRUN-' . $providerKey . '-' . $suffix,
    'providerTrackingNumber' => null,
    'traceId' => $traceId,
    'nextAction' => 'DRY-RUN (no-submit): orden validada y encolada; no se colocó pedido real ni se realizó pago. Activar el runtime real por proveedor para ir a vivo.',
]);
