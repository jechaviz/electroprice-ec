<?php
declare(strict_types=1);

/**
 * Minimal PHP layer for the vhub subshopping runtime. Holds no logic: it execs
 * the native vhub CGI binary and relays its response. Provider credentials (for
 * future transactional actions) come from server-side env files; the binary
 * loads provider AIS specs from disk.
 */

const VHUB_BIN   = '/home/agingriouh/apps/electroprice/shared/bin/vhub-runtime';
const SECRET_ENVS = [
    '/home/agingriouh/apps/electroprice/shared/env/provider.env',
];

if (!is_executable(VHUB_BIN)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'vhub runtime unavailable']);
    exit;
}

$env = [];
foreach ($_SERVER as $k => $v) {
    if (is_string($v)) {
        $env[$k] = $v;
    }
}
foreach (SECRET_ENVS as $file) {
    if (is_readable($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
                continue;
            }
            [$kk, $vv] = explode('=', $line, 2);
            $env[trim($kk)] = trim($vv, " \t\"'");
        }
    }
}

$descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
$process = proc_open(VHUB_BIN, $descriptors, $pipes, null, $env);
if (!is_resource($process)) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'vhub spawn failed']);
    exit;
}

$body = file_get_contents('php://input');
if ($body !== false && $body !== '') {
    fwrite($pipes[0], $body);
}
fclose($pipes[0]);
$out = stream_get_contents($pipes[1]) ?: '';
fclose($pipes[1]);
fclose($pipes[2]);
proc_close($process);

$split = preg_split("/\r\n\r\n|\n\n/", $out, 2);
if (count($split) === 2) {
    foreach (preg_split("/\r\n|\n/", $split[0]) as $line) {
        if ($line === '') {
            continue;
        }
        if (stripos($line, 'Status:') === 0) {
            http_response_code((int) trim(substr($line, 7)));
            continue;
        }
        header($line, false);
    }
    echo $split[1];
} else {
    header('Content-Type: application/json');
    echo $out;
}
