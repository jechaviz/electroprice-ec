<?php
declare(strict_types=1);

/**
 * Minimal cron launcher for the compiled vhub / vimport subshopping runtimes.
 *
 * vhub/vimport are V programs that compile (via C) to native binaries; the
 * shared host has gcc + cron + flock but no V toolchain, so the binaries are
 * built locally (or compiled on the host from V-generated C) and dropped in
 * APP_ROOT/current/bin. This launcher is what cron runs every minute: it takes
 * a flock so runs never overlap, invokes the runtime binary to drain the
 * pending purchase-order queue, and logs the result.
 *
 * SAFETY: default mode is "no-submit" (dry-run) — the binary acknowledges and
 * validates queued POs but contacts no distributor and moves no money. Going
 * live is a per-provider switch (PBM_SUBSHOP_MODE=live + the binary built with
 * that provider's AIS spec enabled), only after sandbox validation and
 * explicit authorization.
 *
 * cron entry (every minute):
 *   * * * * * /usr/bin/flock -n /home/agingriouh/apps/electroprice/shared/run/subshopping.lock \
 *     /usr/local/bin/php /home/agingriouh/apps/electroprice/current/server/subshopping-cron.php >/dev/null 2>&1
 */

$appRoot = getenv('APP_ROOT') ?: '/home/agingriouh/apps/electroprice';
$mode = getenv('PBM_SUBSHOP_MODE') ?: 'no-submit';            // no-submit | live
$runtime = getenv('PBM_SUBSHOP_RUNTIME') ?: 'vhub';           // vhub | vimport
$bin = getenv('PBM_SUBSHOP_BIN') ?: "$appRoot/current/bin/electroprice-subshopping-$runtime";
$logFile = getenv('PBM_SUBSHOP_LOG') ?: "$appRoot/shared/logs/subshopping-$runtime.log";

@mkdir(dirname($logFile), 0775, true);

$log = static function (string $line) use ($logFile): void {
    @file_put_contents($logFile, '[' . gmdate('Y-m-d\TH:i:s\Z') . "] $line\n", FILE_APPEND);
};

// Rotate the log if it grows past ~5 MB.
if (is_file($logFile) && filesize($logFile) > 5 * 1024 * 1024) {
    @rename($logFile, $logFile . '.' . gmdate('YmdHis') . '.bak');
}

if (!is_file($bin) || !is_executable($bin)) {
    // Safe to install the cron before the binary is deployed: just no-op.
    $log("skip: runtime binary not found/executable at $bin");
    exit(0);
}

$cmd = escapeshellarg($bin) . ' --mode=' . escapeshellarg($mode) . ' --once';
$log("start runtime=$runtime mode=$mode");
exec($cmd . ' 2>&1', $out, $code);
$log("done exit=$code " . trim(implode(' | ', array_slice($out, -5))));
exit($code === 0 ? 0 : 1);
