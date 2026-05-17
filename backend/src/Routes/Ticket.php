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

    $controller->create(
        $auth['id']
    );

    exit;
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

    $controller->getOccupiedSeats(
        $auth['id']
    );

    exit;
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

    $controller->getByUserId(
        $auth['id']
    );

    exit;
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

    $controller->markAsPaid(
        $auth['id']
    );

    exit;
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

    $controller->cancel(
        $auth['id']
    );

    exit;
}