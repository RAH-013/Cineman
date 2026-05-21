<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Backend\Middleware\Log;

// 1. Cargar Variables de Entorno (Requerido por Auth.php para $_ENV['JWT_SECRET'])
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
}

// 2. Configuración de Cabeceras Globales y CORS
header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: http://localhost:5173"); // Ajusta al puerto de tu frontend
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 3. Captura de la Petición
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$logMiddleware = new Log();

try {
    // 4. El Pipeline del Log envuelve la ejecución de las rutas
    $response = $logMiddleware->handle(function () use ($uri, $method) {
        
        // Al requerir el archivo de rutas, este debe retornar la respuesta del controlador
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
    
    // 5. Captura dinámica de códigos de error (Evita transformar 401/403 en errores 500)
    $statusCode = http_response_code();
    if ($statusCode === 200 || $statusCode === false) {
        http_response_code(500); // Solo si no se especificó un código previo, asumimos error de servidor
    }

    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

// 6. Output unificado
echo json_encode($response);