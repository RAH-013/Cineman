<?php

$apiPrefix = '/api';

/*
    USERS
*/
if (str_starts_with($uri, $apiPrefix . '/users')) {
    $route = str_replace($apiPrefix . '/users', '', $uri);
    return require __DIR__ . '/User.php';
}

/*
    MOVIES
*/
if (str_starts_with($uri, $apiPrefix . '/movies')) {
    $route = str_replace($apiPrefix . '/movies', '', $uri);
    return require __DIR__ . '/Movie.php';
}

/*
    Showtimes
*/
if (str_starts_with($uri, $apiPrefix . '/showtimes')) {
    $route = str_replace($apiPrefix . '/showtimes', '', $uri);
    return require __DIR__ . '/Showtime.php';
}

/*
    Tickets
*/
if (str_starts_with($uri, $apiPrefix . '/tickets')) {
    $route = str_replace($apiPrefix . '/tickets', '', $uri);
    return require __DIR__ . '/Ticket.php';
}

/*
    Sistema
*/
if (str_starts_with($uri, $apiPrefix . '/system')) {
    $route = str_replace($apiPrefix . '/system', '', $uri);
    return require __DIR__ . '/System.php';
}

/*
    Chat
*/
if (str_starts_with($uri, $apiPrefix . '/chat')) {
    $route = str_replace($apiPrefix . '/chat', '', $uri);
    return require __DIR__ . '/Chat.php';
}

http_response_code(404);
return [
    'success' => false,
    'message' => 'Ruta base no encontrada'
];