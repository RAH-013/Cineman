<?php

use Backend\Controllers\Ticket;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new Ticket();

/*
    CREATE TICKET
    POST /api/tickets
*/
if ($route === '' && $method === 'POST') {
    $auth = AuthMiddleware::requireAuth();

    AuthMiddleware::requireRole([
        'user',
        'admin',
        'manager'
    ]);

    return $controller->create($auth['id']);
}

/*
    GET OCCUPIED SEATS
    GET /api/tickets/
*/
if ($route === '' && $method === 'GET') {
    $auth = AuthMiddleware::requireAuth();

    AuthMiddleware::requireRole([
        'user',
        'admin',
        'manager'
    ]);

    return $controller->getOccupiedSeats($auth['id']);
}

/*
    GET MY TICKETS
    GET /api/tickets/me
*/
if ($route === '/me' && $method === 'GET') {
    $auth = AuthMiddleware::requireAuth();

    AuthMiddleware::requireRole([
        'user',
        'admin',
        'manager'
    ]);

    return $controller->getByUserId($auth['id']);
}

/*
    MARK TICKET AS PAID
    PATCH /api/tickets/pay
*/
if ($route === '/pay' && $method === 'PATCH') {
    $auth = AuthMiddleware::requireAuth();

    AuthMiddleware::requireRole([
        'user',
        'admin',
        'manager'
    ]);

    return $controller->markAsPaid($auth['id']);
}

/*
    CANCEL TICKET
    PATCH /api/tickets/cancel
*/
if ($route === '/cancel' && $method === 'PATCH') {
    $auth = AuthMiddleware::requireAuth();

    AuthMiddleware::requireRole([
        'user',
        'admin',
        'manager'
    ]);

    return $controller->cancel($auth['id']);
}

/*
    FALLBACK PARA TICKETS
*/
http_response_code(405);
return [
    'success' => false,
    'message' => 'Método o ruta no permitida en Tickets'
];