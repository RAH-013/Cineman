<?php

use Backend\Controllers\Movie;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new Movie();

/*
    CREATE MOVIE
    POST /api/movies
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
    UPDATE MOVIE
    PUT /api/movies
*/
if ($route === '' && $method === 'PUT') {

    AuthMiddleware::requireRole([
        'admin',
        'manager'
    ]);

    $body = json_decode(
        file_get_contents('php://input'),
        true
    );

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

    $controller->update(
        $id,
        $body
    );

    exit;
}

/*
    DELETE MOVIE
    DELETE /api/movies/?id=UUID
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
    GET MOVIE BY ID
    GET /api/movies/?id=
*/
if ($route === '/' && $method === 'GET') {

    AuthMiddleware::requireRole([
        'admin',
        'manager'
    ]);

    $controller->findById();
    exit;
}

/*
    GET MOVIE BY TITLE
    GET /api/movies/?title=
*/
if ($route === '/search' && $method === 'GET') {

    $controller->findByTitle();
    exit;
}

/*
    GET ALL MOVIES
    GET /api/movies
*/
if ($route === '' && $method === 'GET') {
    AuthMiddleware::requireRole([
        'admin',
        'manager'
    ]);

    $controller->get();
    exit;
}

/*
    GET INACTIVE MOVIES
    GET /api/movies/inactive
*/
if ($route === '/inactive' && $method === 'GET') {
    AuthMiddleware::requireRole([
        'admin',
        'manager'
    ]);

    $controller->getInactive();
    exit;
}

/*
    GET ACTIVE MOVIES
    GET /api/movies/active
*/
if ($route === '/active' && $method === 'GET') {

    $controller->getActive();
    exit;
}