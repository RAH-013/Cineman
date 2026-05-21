<?php

namespace Backend\Controllers;

use Backend\Models\User as UserModel;
use Backend\Utils\UUID;
use Firebase\JWT\JWT;

class User
{
    private UserModel $model;

    public function __construct()
    {
        $this->model = new UserModel();
    }

    public function create(): array
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (!isset($body['email'], $body['password'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Campos faltantes'];
        }

        $id = UUID::generate();

        $created = $this->model->create($id, $body['email'], $body['password']);

        if (!$created) {
            http_response_code(500);
            return ['success' => false, 'message' => 'No se pudo crear el usuario'];
        }

        return ['success' => true, 'id' => $id];
    }

    public function login(): array
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (!isset($body['email'], $body['password'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Campos faltantes'];
        }

        $user = $this->model->findByEmail($body['email']);

        if (!$user || !password_verify($body['password'], $user['password'])) {
            http_response_code(401);
            return ['success' => false, 'message' => 'Credenciales inválidas'];
        }

        $payload = [
            'id'  => $user['id'],
            'role' => $user['role'],
            'jti'  => UUID::generate(),
            'iat'  => time(),
            'exp'  => time() + 3600
        ];

        $token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

        setcookie('token', $token, [
            'expires' => time() + 7200,
            'path' => '/',
            'httponly' => true,
            'secure' => false,
            'samesite' => 'Lax'
        ]);

        return [
            'success' => true,
            'message' => 'Login exitoso'
        ];
    }

    public function logout(): array
    {
        setcookie('token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'secure' => false,
            'samesite' => 'Lax'
        ]);

        return [
            'success' => true,
            'message' => 'Logout exitoso'
        ];
    }

    public function update(string $id, array $data, bool $isOwner = false): array
    {
        $updated = $this->model->update($id, $data);

        if (!$updated) {
            http_response_code(500);
            return ['success' => false, 'message' => 'No se pudo actualizar el usuario'];
        }

        if ($isOwner && isset($data['password'])) {
            setcookie('token', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'httponly' => true,
                'secure' => false,
                'samesite' => 'Lax'
            ]);
        }

        return [
            'success' => true,
            'message' => isset($data['password'])
                ? 'Datos actualizados. Debe volver a iniciar sesión.'
                : 'Usuario actualizado correctamente'
        ];
    }

    public function delete(string $id, bool $isOwner): array
    {
        $this->model->delete($id);

        if ($isOwner) {
            setcookie('token', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'httponly' => true,
                'secure' => false,
                'samesite' => 'Lax'
            ]);
        }

        return [
            'success' => true,
            'message' => 'Usuario eliminado'
        ];
    }

    public function findById(): array
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Falta ID'];
        }

        $user = $this->model->getById($id);

        return [
            'success' => true,
            'data' => $user
        ];
    }

    public function get(string $id): array
    {
        return [
            'success' => true,
            'data' => $this->model->get($id)
        ];
    }

    public function getAvatar(?string $id, bool $icon): array|string
    {
        if (!$id) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Falta ID de usuario'];
        }

        $user = $this->model->getAvatarData($id);

        if (!$user) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Usuario no encontrado'];
        }

        $hash = array_sum(array_map('ord', str_split($id . $user['id'] . ($user['lastname'] ?? ''))));
        $hue = $hash % 360;

        $color1 = "hsl($hue, 70%, 40%)";
        $color2 = "hsl(" . (($hue + 30) % 360) . ", 60%, 50%)";

        $svgContent = '';

        if ($icon) {
            $svgContent = "
                <svg x='20' y='20' width='60' height='60' viewBox='0 0 640 640' fill='#ffffff'>
                    <path d='M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z'/>
                </svg>";
        } else {
            $initials = 'YO';
            if (!empty($user['name'])) {
                $initials = strtoupper($user['name'][0]) . strtoupper($user['lastname'][0] ?? '');
            } elseif (!empty($user['lastname'])) {
                $initials = strtoupper($user['lastname'][0]);
            }

            $svgContent = "
                <text x='50' y='53' text-anchor='middle'
                    dominant-baseline='middle'
                    font-size='40'
                    font-family='Sans-serif'
                    font-weight='bold'
                    fill='#fff'>
                    $initials
                </text>";
        }

        header('Content-Type: image/svg+xml; charset=UTF-8');

        return "
            <svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'>
                <defs>
                    <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
                        <stop offset='0%' stop-color='$color1'/>
                        <stop offset='100%' stop-color='$color2'/>
                    </linearGradient>
                </defs>
                <rect width='100' height='100' fill='url(#g)' />
                $svgContent
            </svg>
        ";
    }
}