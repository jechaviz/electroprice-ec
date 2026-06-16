<?php
declare(strict_types=1);

/**
 * Minimal PHP layer: the only purpose of this file is to be the Apache/cPanel
 * entrypoint that execs the native V-compiled CGI binary and relays its
 * response. All routing, MySQL access, auth and business logic live in the V
 * binary. PHP holds no application logic.
 *
 * The binary speaks plain CGI: it reads the request from environment variables
 * (REQUEST_METHOD, REQUEST_URI, ...) and the body from stdin, and writes
 * "Header: value\r\n...\r\n\r\n<body>" to stdout.
 */

$binary = getenv('PBM_VBACKEND_BIN') ?: (__DIR__ . '/pbm-vbackend');
if (!is_executable($binary)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Backend binary unavailable.', 'code' => 500]);
    exit;
}

// Pass the HTTP request through to the CGI binary's environment. getenv()/$_SERVER
// already carry the CGI vars (REQUEST_METHOD, REQUEST_URI, QUERY_STRING, HTTP_*),
// plus the app config the docroot endpoint exported (PBM_MYSQL_ENV, secrets).
$descriptors = [
    0 => ['pipe', 'r'], // stdin  -> request body
    1 => ['pipe', 'w'], // stdout <- CGI response
    2 => ['pipe', 'w'], // stderr
];

$process = proc_open($binary, $descriptors, $pipes, null, null);
if (!is_resource($process)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Backend spawn failed.', 'code' => 500]);
    exit;
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
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Backend error.', 'code' => 502, 'detail' => substr($err, 0, 500)]);
    exit;
}

// Split CGI headers from body and re-emit them through PHP.
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
