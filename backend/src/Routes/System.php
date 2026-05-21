<?php

use Backend\Controllers\System;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new System();

/*
    GET LAST BACKUP
    GET /api/system/last-backup
*/
if ($route === '/last-backup' && $method === 'GET') {
    AuthMiddleware::requireRole(['admin']);
    $_GET['new'] = false;

    return $controller->getBackup();
}

/*
    CREATE NEW BACKUP
    GET /api/system/new-backup
*/
if ($route === '/new-backup' && $method === 'GET') {
    AuthMiddleware::requireRole(['admin']);
    $_GET['new'] = true;

    return $controller->getBackup();
}

/*
    USERS SEED
    POST /api/system/users-seed
*/
if ($route === '/users-seed' && $method === 'POST') {
    AuthMiddleware::requireRole(['admin']);

    return $controller->setUsers();
}

/*
    RESTORE BACKUP
    POST /api/system/restore-backup
*/
if ($route === '/restore-backup' && $method === 'POST') {
    AuthMiddleware::requireRole(['admin']);

    return $controller->setBackup();
}

/*
    CREATE LOG
    POST /api/system/logs
*/
if ($route === '/logs' && $method === 'POST') {
    AuthMiddleware::requireRole(['admin']);

    return $controller->createLog();
}

/*
    GET LOGS
    GET /api/system/logs
*/
if ($route === '/logs' && $method === 'GET') {
    AuthMiddleware::requireRole(['admin']);

    return $controller->getLogs();
}

/*
    FALLBACK PARA SITEMA
*/
http_response_code(405);
return [
    'success' => false,
    'message' => 'Método o ruta no permitida en Sistema'
];