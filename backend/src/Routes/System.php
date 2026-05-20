<?php

use Backend\Controllers\System;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new System();

/*
    GET LAST BACKUP
    GET /api/system/lastBackup
*/
if ($route === '/lastBackup' && $method === 'GET') {

    AuthMiddleware::requireRole([
        'admin'
    ]);

    $_GET['new'] = false;

    $controller->getBackup();

    exit;
}

/*
    CREATE NEW BACKUP
    GET /api/system/newBackup
*/
if ($route === '/newBackup' && $method === 'GET') {

    AuthMiddleware::requireRole([
        'admin'
    ]);

    $_GET['new'] = true;

    $controller->getBackup();

    exit;
}

/*
    USERS SEED
    POST /api/system/usersSeed
*/
if ($route === '/usersSeed' && $method === 'POST') {

    AuthMiddleware::requireRole([
        'admin'
    ]);

    $controller->setUsers();

    exit;
}

/*
    RESTORE BACKUP
    POST /api/system/restoreBackup
*/
if ($route === '/restoreBackup' && $method === 'POST') {

    AuthMiddleware::requireRole([
        'admin'
    ]);

    $controller->setBackup();

    exit;
}