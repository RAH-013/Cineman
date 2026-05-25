<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Backend\Middleware\Log;


if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
}


header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:5173"); // Ajusta al puerto de tu frontend
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$logMiddleware = new Log();

try {
   
    $response = $logMiddleware->handle(function () use ($uri, $method) {
        
       
        $routes = require __DIR__ . '/../src/Routes/Api.php';
        
        return $routes;
    });

    if ($response === null || $response === 1) {
        http_response_code(404); // Si el archivo de rutas no atrapó nada, es un 404 Not Found
        $response = [
            'success' => false,
            'message' => 'Endpoint no encontrado o ruta mal definida'
        ];
    }

} catch (\Throwable $e) {
    $statusCode = http_response_code();
    if ($statusCode === 200 || $statusCode === false) {
        http_response_code(500); // Solo si no se especificó un código previo, asumimos error de servidor
    }

    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

echo json_encode($response);