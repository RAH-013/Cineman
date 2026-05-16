<?php

use Backend\Controllers\User;
use Backend\Middleware\Auth as AuthMiddleware;

$controller = new User();

/*
    LOGIN
    POST /api/users/login
*/
if ($route === '/login' && $method === 'POST') {
    $controller->login();
    exit;
}

/*
    LOGOUT
    POST /api/users/logout
*/
if ($route === '/logout' && $method === 'POST') {

    AuthMiddleware::requireAuth();

    $controller->logout();
    exit;
}

/*
    CREATE USER
    POST /api/users
*/
if ($route === '' && $method === 'POST') {
    $controller->create();
    exit;
}

/*
    UPDATE USER
    PUT /api/users
*/
if ($route === '' && $method === 'PUT') {

    $auth = AuthMiddleware::requireAuth();

    $body = json_decode(
        file_get_contents('php://input'),
        true
    );

    /*
        Admin can edit anyone.
        User can only edit self.
    */
    $targetId = $body['id'] ?? $auth['id'];

    $isOwner = $auth['id'] === $targetId;
    $isAdmin = $auth['role'] === 'admin';

    if (!$isOwner && !$isAdmin) {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'Contenido Protegido'
        ]);

        exit;
    }

    /*
        Only admin can change roles
    */
    if (
        isset($body['role']) &&
        !$isAdmin
    ) {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'Acción prohibida para tu usuario'
        ]);

        exit;
    }

    $controller->update(
        $targetId,
        $body,
        $isOwner
    );

    exit;
}

/*
    DELETE USER (OWNER OR ADMIN)
    DELETE /api/users
*/
if ($route === '' && $method === 'DELETE') {

    $auth = AuthMiddleware::requireAuth();

    $body = json_decode(
        file_get_contents('php://input'),
        true
    );

    $id = $body['id'] ?? $auth['id'];

    $isOwner = $auth['id'] === $id;
    $isAdmin = $auth['role'] === 'admin';

    if (!$isOwner && !$isAdmin) {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'Forbidden'
        ]);

        exit;
    }

    $controller->delete($id);
    exit;
}

/*
    GET USER BY ID (OWNER OR ADMIN)
    POST /api/users/get
*/
if ($route === '/get' && $method === 'GET') {

    $auth = AuthMiddleware::requireAuth();

    $id = $_GET['id'] ?? $auth['id'];

    $isOwner = $auth['id'] === $id;
    $isAdmin = $auth['role'] === 'admin';

    if (!$isOwner && !$isAdmin) {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'Forbidden'
        ]);

        exit;
    }

    $_GET['id'] = $id;

    $controller->findById();
    exit;
}

/*
    GET ALL USERS (ADMIN ONLY)
    GET /api/users
*/
if ($route === '' && $method === 'GET') {

    $auth = AuthMiddleware::requireAuth();

    if ($auth['role'] !== 'admin') {

        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'Contenido protegido'
        ]);

        exit;
    }

    $controller->get($auth['id']);
    exit;
}

/*
    GET USER AVATAR
    GET /api/users/avatar
*/
if ($route === '/avatar' && $method === 'GET') {

    AuthMiddleware::requireAuth();

    $controller->getAvatar();

    exit;
}