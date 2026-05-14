<?php

namespace Backend\Middleware;

class Role
{
    public static function requireRoles(array $user, array $roles): void
    {
        if (!in_array($user['role'], $roles, true)) {
            http_response_code(403);

            echo json_encode([
                'success' => false,
                'message' => 'Forbidden'
            ]);

            exit;
        }
    }

    public static function requireAdmin(array $user): void
    {
        self::requireRoles($user, ['admin']);
    }

    public static function requireManagerOrAdmin(array $user): void
    {
        self::requireRoles($user, ['admin', 'manager']);
    }
}