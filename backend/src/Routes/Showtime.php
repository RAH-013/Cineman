<?php

use Backend\Controllers\Showtime;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new Showtime();

/*
    CREATE SHOWTIME
    POST /api/showtimes
*/
if ($route === '' && $method === 'POST') {
    AuthMiddleware::requireRole(['admin', 'manager']);
    return $controller->create();
}

/*
    UPDATE SHOWTIME
    PUT /api/showtimes
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
    DELETE SHOWTIME
    DELETE /api/showtimes?id=UUID
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
    GET SHOWTIME BY ID
    GET /api/showtimes?id=
*/
if ($route === '' && $method === 'GET') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        return [
            'success' => false,
            'message' => 'Falta ID'
        ];
    }

    return $controller->findById($id);
}

/*
    GET SHOWTIMES BY MOVIE
    GET /api/showtimes/movie?movie_id=
*/
if ($route === '/movie' && $method === 'GET') {
    $id = $_GET['movie_id'] ?? null;

    if (!$id) {
        http_response_code(400);
        return [
            'success' => false,
            'message' => 'Falta movie_id'
        ];
    }

    return $controller->findByMovieId($id);
}

/*
    GET ALL SHOWTIMES
    GET /api/showtimes/all
*/
if ($route === '/all' && $method === 'GET') {
    AuthMiddleware::requireRole(['admin', 'manager']);
    return $controller->get();
}

/*
    FALLBACK PARA SHOWTIMES
*/
http_response_code(405);
return [
    'success' => false,
    'message' => 'Método o ruta no permitida en Showtimes'
];