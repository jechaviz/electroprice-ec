<?php
declare(strict_types=1);

/**
 * Minimal PHP layer: the only PHP in the request path. It execs the native
 * V-compiled CGI binary and relays its response. It holds NO application logic;
 * it just supplies the binary's environment (CGI vars from $_SERVER + secrets
 * loaded from server-side env files) and pipes the request body in / response out.
 */

const VBACKEND_BIN = '/home/agingriouh/apps/electroprice/shared/bin/pbm-vbackend';
const MYSQL_ENV    = '/home/agingriouh/apps/electroprice/shared/env/mysql.env';
const SECRET_ENVS  = [
    '/home/agingriouh/apps/electroprice/shared/env/vbackend.env', // PBM_AUTH_SECRET, PBM_GOOGLE_CLIENT_ID
    '/home/agingriouh/apps/electroprice/shared/env/provider.env', // optional GEMINI_API_KEY / BANXICO_API_TOKEN
];

function fail(int $code, string $message): never {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['code' => $code, 'message' => $message, 'data' => new stdClass()]);
    exit;
}

function load_env_file(string $path): array {
    $out = [];
    if (!is_readable($path)) {
        return $out;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
            continue;
        }
        [$k, $v] = explode('=', $line, 2);
        $out[trim($k)] = trim($v, " \t\"'");
    }
    return $out;
}

if (!is_executable(VBACKEND_BIN)) {
    fail(500, 'Backend binary unavailable.');
}

// Build the binary's environment: CGI vars + app config + secrets.
$env = [];
foreach ($_SERVER as $k => $v) {
    if (is_string($v)) {
        $env[$k] = $v;
    }
}
$env['PBM_MYSQL_ENV'] = MYSQL_ENV;
foreach (SECRET_ENVS as $file) {
    foreach (load_env_file($file) as $k => $v) {
        $env[$k] = $v;
    }
}
// Ensure the Authorization header reaches the binary even when the SAPI hides it.
if (!isset($env['HTTP_AUTHORIZATION']) && function_exists('getallheaders')) {
    foreach (getallheaders() as $hk => $hv) {
        if (strcasecmp($hk, 'Authorization') === 0) {
            $env['HTTP_AUTHORIZATION'] = $hv;
        }
    }
}

$descriptors = [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
$process = proc_open(VBACKEND_BIN, $descriptors, $pipes, null, $env);
if (!is_resource($process)) {
    fail(502, 'Backend spawn failed.');
}

$body = file_get_contents('php://input');
if ($body !== false && $body !== '') {
    fwrite($pipes[0], $body);
}
fclose($pipes[0]);
$out = stream_get_contents($pipes[1]) ?: '';
fclose($pipes[1]);
$err = stream_get_contents($pipes[2]) ?: '';
fclose($pipes[2]);
$status = proc_close($process);

if ($status !== 0 && $out === '') {
    fail(502, 'Backend error: ' . substr($err, 0, 300));
}

// Split CGI headers from body and re-emit them.
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
