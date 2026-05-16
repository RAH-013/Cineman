<?php

$apiPrefix = '/api';

/*
    USERS
*/
if (str_starts_with($uri, $apiPrefix . '/users')) {

    $route = str_replace(
        $apiPrefix . '/users',
        '',
        $uri
    );

    require_once __DIR__ . '/User.php';

    exit;
}

/*
    MOVIES
*/
if (str_starts_with($uri, $apiPrefix . '/movies')) {

    $route = str_replace(
        $apiPrefix . '/movies',
        '',
        $uri
    );

    require_once __DIR__ . '/Movie.php';

    exit;
}

http_response_code(404);

echo json_encode([
    'success' => false,
    'message' => 'Ruta no encontrada'
]);