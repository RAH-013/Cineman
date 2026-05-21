<?php

use Backend\Controllers\User;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new User();

/*
    LOGIN
    POST /api/users/login
*/
if ($route === '/login' && $method === 'POST') {
    return $controller->login();
}

/*
    LOGOUT
    POST /api/users/logout
*/
if ($route === '/logout' && $method === 'POST') {
    AuthMiddleware::requireAuth();
    return $controller->logout();
}

/*
    CREATE USER
    POST /api/users
*/
if ($route === '' && $method === 'POST') {
    return $controller->create();
}

/*
    UPDATE USER
    PUT /api/users
*/
if ($route === '' && $method === 'PUT') {
    $auth = AuthMiddleware::requireAuth();
    $body = json_decode(file_get_contents('php://input'), true);

    $targetId = $body['id'] ?? $auth['id'];
    $isOwner = $auth['id'] === $targetId;
    $isAdmin = $auth['role'] === 'admin';

    if (!$isOwner && !$isAdmin) {
        http_response_code(403);
        return ['success' => false, 'message' => 'Contenido Protegido'];
    }

    if (isset($body['role']) && !$isAdmin) {
        http_response_code(403);
        return ['success' => false, 'message' => 'Acción prohibida para tu usuario'];
    }

    return $controller->update($targetId, $body, $isOwner);
}

/*
    DELETE USER
    DELETE /api/users
*/
if ($route === '' && $method === 'DELETE') {
    $auth = AuthMiddleware::requireAuth();
    $id = $_GET['user_id'] ?? $auth['id'];

    $isOwner = $auth['id'] === $id;
    $isAdmin = $auth['role'] === 'admin';

    if (!$isOwner && !$isAdmin) {
        http_response_code(403);
        return ['success' => false, 'message' => 'Protegido'];
    }

    return $controller->delete($id, $isOwner);
}

/*
    GET USER BY ID
*/
if ($route === '/get' && $method === 'GET') {
    $auth = AuthMiddleware::requireAuth();
    $id = $_GET['id'] ?? $auth['id'];

    $isOwner = $auth['id'] === $id;
    $isAdmin = $auth['role'] === 'admin';

    if (!$isOwner && !$isAdmin) {
        http_response_code(403);
        return ['success' => false, 'message' => 'Protegido'];
    }

    $_GET['id'] = $id;
    return $controller->findById();
}

/*
    GET ALL USERS
*/
if ($route === '' && $method === 'GET') {
    $auth = AuthMiddleware::requireAuth();

    if ($auth['role'] !== 'admin') {
        http_response_code(403);
        return ['success' => false, 'message' => 'Contenido protegido'];
    }

    return $controller->get($auth['id']);
}

/*
    AVATAR (SVG STREAM)
    GET /api/users/avatar
*/
if ($route === '/avatar' && $method === 'GET') {
    AuthMiddleware::requireAuth();

    $svg = $controller->getAvatar(
        $_GET['id'] ?? null,
        filter_var($_GET['icon'] ?? false, FILTER_VALIDATE_BOOLEAN)
    );

    header('Content-Type: image/svg+xml');
    echo $svg;
    exit; 
}

/*
    FALLBACK PARA USERS
*/
http_response_code(405);
return [
    'success' => false,
    'message' => 'Método o ruta no permitida en Usuarios'
];