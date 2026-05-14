<?php

namespace Backend\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth
{
    private const ROLES = ['admin', 'manager', 'user'];

    private static function secret(): string
    {
        return $_ENV['JWT_SECRET'];
    }

    public static function user(): ?array
    {
        if (!isset($_COOKIE['token'])) {
            return null;
        }

        try {
            $payload = (array) JWT::decode(
                $_COOKIE['token'],
                new Key(self::secret(), 'HS256')
            );
        } catch (\Throwable $e) {
            return null;
        }

        if (!isset($payload['role']) || !in_array($payload['role'], self::ROLES, true)) {
            return null;
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    public static function requireAuth(): array
    {
        $user = self::user();

        if (!$user) {
            http_response_code(401);

            echo json_encode([
                'success' => false,
                'message' => 'Identificate'
            ]);

            exit;
        }

        return $user;
    }

    public static function requireRole(array $allowedRoles): array
    {
        $user = self::requireAuth();

        if (!in_array($user['role'], $allowedRoles, true)) {
            http_response_code(403);

            echo json_encode([
                'success' => false,
                'message' => 'Contenido protegido'
            ]);

            exit;
        }

        return $user;
    }
}