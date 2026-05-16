<?php

namespace Backend\Controllers;

use Backend\Models\User as UserModel;
use Backend\Utils\UUID;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class User
{
    private UserModel $model;

    public function __construct()
    {
        $this->model = new UserModel();
    }

    public function create(): void
    {
        $body = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (
            !isset(
                $body['email'],
                $body['password']
            )
        ) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Campos faltantes'
            ]);

            return;
        }

        $id = UUID::generate();

        $created = $this->model->create(
            $id,
            $body['email'],
            $body['password']
        );

        if (!$created) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo crear el usuario'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'id' => $id
        ]);
    }

    public function login(): void
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (!isset($body['email'], $body['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos faltantes']);
            return;
        }

        $user = $this->model->findByEmail($body['email']);

        if (!$user || !password_verify($body['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
            return;
        }

        $payload = [
            'id' => $user['id'],
            'role' => $user['role'],
            'exp' => time() + 7200
        ];

        $token = JWT::encode(
            $payload,
            $_ENV['JWT_SECRET'],
            'HS256'
        );

        setcookie('token', $token, [
            'expires' => time() + 7200,
            'path' => '/',
            'httponly' => true,
            'secure' => false,
            'samesite' => 'Lax'
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Login exitoso'
        ]);
    }

    public function logout(): void
    {
        setcookie('token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'secure' => false,
            'samesite' => 'Lax'
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Logout exitoso'
        ]);
    }

    public function update(
        string $id,
        array $data,
        bool $isOwner = false
    ): void
    {
        $updated = $this->model->update(
            $id,
            $data
        );

        if (!$updated) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo actualizar el usuario'
            ]);

            return;
        }

        /*
            Close session if password changed
            on own account
        */
        if (
            $isOwner &&
            isset($data['password'])
        ) {

            setcookie('token', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'httponly' => true,
                'secure' => false,
                'samesite' => 'Lax'
            ]);
        }

        echo json_encode([
            'success' => true,
            'message' => isset($data['password'])
                ? 'Datos actualizados. Debe volver a iniciar sesión.'
                : 'Usuario actualizado correctamente'
        ]);
    }

    public function delete(string $id): void
    {
        $this->model->delete($id);

        setcookie('token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'secure' => false,
            'samesite' => 'Lax'
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Usuario eliminado'
        ]);
    }

    public function findById(): void
    {
        
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Falta ID']);
            return;
        }

        $user = $this->model->getById($id);

        echo json_encode([
            'success' => true,
            'data' => $user
        ]);
    }

    public function get(string $id): void
    {
        $users = $this->model->get($id);

        echo json_encode([
            'success' => true,
            'data' => $users
        ]);
    }

    public function getAvatar(): void
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Falta ID'
            ]);

            return;
        }

        $this->model->getAvatar($id);
    }
}