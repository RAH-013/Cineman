<?php

use Backend\Controllers\Showtime;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new Showtime();

/*
    CREATE SHOWTIME
    POST /api/showtimes
*/
if ($route === '' && $method === 'POST') {

    AuthMiddleware::requireRole([
        'admin',
        'manager'
    ]);

    $controller->create();
    exit;
}

/*
    UPDATE SHOWTIME
    PUT /api/showtimes
*/
if ($route === '' && $method === 'PUT') {

    AuthMiddleware::requireRole([
        'admin',
        'manager'
    ]);

    $body = json_decode(file_get_contents('php://input'), true);

    if (!isset($body['id'])) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Falta ID'
        ]);

        exit;
    }

    $id = $body['id'];
    unset($body['id']);

    $controller->update($id, $body);
    exit;
}

/*
    DELETE SHOWTIME
    DELETE /api/showtimes/?id=UUID
*/
if ($route === '/' && $method === 'DELETE') {

    AuthMiddleware::requireRole([
        'admin',
        'manager'
    ]);

    $id = $_GET['id'] ?? null;

    if (!$id) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Falta ID'
        ]);

        exit;
    }

    $controller->delete($id);
    exit;
}

/*
    GET SHOWTIME BY ID
    GET /api/showtimes/?id=
*/
if ($route === '/' && $method === 'GET') {
    $id = $_GET['id'] ?? null;

    if (!$id) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Falta ID'
        ]);

        exit;
    }

    $controller->findById($id);
    exit;
}

/*
    GET SHOWTIMES BY MOVIE
    GET /api/showtimes/?movie_id=
*/
if ($route === '/movie/' && $method === 'GET') {
    $id = $_GET['movie_id'] ?? null;

    if (!$id) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Falta movie_id'
        ]);

        exit;
    }

    $controller->findByMovieId($id);
    exit;
}

/*
    GET ALL SHOWTIMES
    GET /api/showtimes
*/
if ($route === '/all' && $method === 'GET') {

    AuthMiddleware::requireRole([
        'admin',
        'manager'
    ]);

    $controller->get();
    exit;
}