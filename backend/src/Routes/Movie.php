<?php

use Backend\Controllers\Movie;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new Movie();

/*
    CREATE MOVIE
    POST /api/movies
*/
if ($route === '' && $method === 'POST') {
    AuthMiddleware::requireRole(['admin', 'manager']);
    return $controller->create();
}

/*
    UPDATE MOVIE
    PUT /api/movies
*/
if ($route === '' && $method === 'PUT') {
    AuthMiddleware::requireRole(['admin', 'manager']);
    $body = json_decode(file_get_contents('php://input'), true);

    if (!isset($body['id'])) {
        http_response_code(400);
        return [
            'success' => false,
            'message' => 'Falta ID'
        ];
    }

    $id = $body['id'];
    unset($body['id']);

    return $controller->update($id, $body);
}

/*
    DELETE MOVIE
    DELETE /api/movies?id=UUID
*/
if ($route === '' && $method === 'DELETE') {
    AuthMiddleware::requireRole(['admin', 'manager']);
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        return [
            'success' => false,
            'message' => 'Falta ID'
        ];
    }

    return $controller->delete($id);
}

/*
    GET MOVIES (Panel de Administración)
    GET /api/movies o GET /api/movies?id=UUID
*/
if ($route === '' && $method === 'GET') {
    AuthMiddleware::requireRole(['admin', 'manager']);

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        return $controller->findById();
    }

    return $controller->get();
}

/*
    GET ACTIVE MOVIES (Cartelera Pública)
    GET /api/movies/active o GET /api/movies/active?id=UUID
*/
if ($route === '/active' && $method === 'GET') {
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        return $controller->findActiveById();
    }

    return $controller->getActive();
}

/*
    FALLBACK PARA MOVIES
*/
if ($route === '') {
    http_response_code(405);
    return [
        'success' => false,
        'message' => 'Método ' . $method . ' no permitido para este endpoint'
    ];
}

http_response_code(404);
return [
    'success' => false,
    'message' => 'Acción no encontrada en el módulo de películas'
];