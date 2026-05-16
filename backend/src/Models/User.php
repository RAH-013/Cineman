<?php

namespace Backend\Models;

use Backend\Config\Database;
use PDO;

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function get(string $excludeId): array
    {
        $sql = "
            SELECT id, email, role
            FROM users
            WHERE id != :id
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':id' => $excludeId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(string $id): array|false
    {
        $sql = "
            SELECT
                users.id,
                users.email,
                users.role,

                user_profiles.name,
                user_profiles.lastname,
                user_profiles.phone

            FROM users

            LEFT JOIN user_profiles
                ON user_profiles.user_id = users.id

            WHERE users.id = :id

            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail(string $email): array|false
    {
        $sql = "SELECT id, email, password, role FROM users WHERE email = :email LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email]);

        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function create(
        string $id,
        string $email,
        string $password,
        string $role = 'user'
    ): bool {

        try {

            $this->db->beginTransaction();

            /*
                CREATE USER
            */
            $userSql = "
                INSERT INTO users (
                    id,
                    email,
                    password,
                    role
                )
                VALUES (
                    :id,
                    :email,
                    :password,
                    :role
                )
            ";

            $userStmt = $this->db->prepare($userSql);

            $userStmt->execute([
                ':id' => $id,
                ':email' => $email,
                ':password' => password_hash(
                    $password,
                    PASSWORD_BCRYPT
                ),
                ':role' => $role
            ]);

            /*
                CREATE EMPTY PROFILE
            */
            $profileSql = "
                INSERT INTO user_profiles (
                    user_id
                )
                VALUES (
                    :user_id
                )
            ";

            $profileStmt = $this->db->prepare($profileSql);

            $profileStmt->execute([
                ':user_id' => $id
            ]);

            $this->db->commit();

            return true;

        } catch (\Throwable $e) {

            $this->db->rollBack();

            return false;
        }
    }

    public function update(
        string $id,
        array $data
    ): bool {

        $userFields = [];
        $userParams = [
            ':id' => $id
        ];

        /*
            USERS TABLE
        */
        if (isset($data['email'])) {

            $userFields[] = 'email = :email';

            $userParams[':email'] = $data['email'];
        }

        if (isset($data['password'])) {

            $userFields[] = 'password = :password';

            $userParams[':password'] = password_hash(
                $data['password'],
                PASSWORD_BCRYPT
            );
        }

        if (isset($data['role'])) {

            $userFields[] = 'role = :role';

            $userParams[':role'] = $data['role'];
        }

        /*
            USER PROFILES TABLE
        */
        $profileFields = [];
        $profileParams = [
            ':user_id' => $id
        ];

        if (isset($data['name'])) {

            $profileFields[] = 'name = :name';

            $profileParams[':name'] = $data['name'];
        }

        if (isset($data['lastname'])) {

            $profileFields[] = 'lastname = :lastname';

            $profileParams[':lastname'] = $data['lastname'];
        }

        if (isset($data['phone'])) {

            $profileFields[] = 'phone = :phone';

            $profileParams[':phone'] = $data['phone'];
        }

        try {

            $this->db->beginTransaction();

            /*
                UPDATE USERS
            */
            if (!empty($userFields)) {

                $userSql = "
                    UPDATE users
                    SET " . implode(', ', $userFields) . "
                    WHERE id = :id
                ";

                $userStmt = $this->db->prepare($userSql);

                $userStmt->execute($userParams);
            }

            /*
                UPDATE PROFILE
            */
            if (!empty($profileFields)) {

                $profileSql = "
                    UPDATE user_profiles
                    SET " . implode(', ', $profileFields) . "
                    WHERE user_id = :user_id
                ";

                $profileStmt = $this->db->prepare($profileSql);

                $profileStmt->execute($profileParams);
            }

            $this->db->commit();

            return true;

        } catch (\Throwable $e) {

            $this->db->rollBack();

            return false;
        }
    }

    public function delete(string $id): bool
    {
        $sql = "
            DELETE FROM users
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':id' => $id
        ]);
    }

    public function getAvatar(string $userId): void
    {
        $sql = "
            SELECT
                users.id,

                user_profiles.name,
                user_profiles.lastname

            FROM users

            LEFT JOIN user_profiles
                ON user_profiles.user_id = users.id

            WHERE users.id = :id

            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':id' => $userId
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {

            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]);

            return;
        }

        /*
            GENERATE SVG
        */
        $hash = array_sum(
            array_map(
                'ord',
                str_split(
                    $userId .
                    $user['id'] .
                    ($user['lastname'] ?? '')
                )
            )
        );

        $hue = $hash % 360;

        $color1 = "hsl({$hue}, 70%, 40%)";

        $color2 = "hsl(" . (($hue + 30) % 360) . ", 60%, 50%)";

        if (!empty(trim($user['name'] ?? ''))) {

            $initials =
                strtoupper($user['name'][0]) .
                strtoupper($user['lastname'][0] ?? '');

        } elseif (!empty(trim($user['lastname'] ?? ''))) {

            $initials = strtoupper(
                $user['lastname'][0]
            );

        } else {

            $initials = 'YO';
        }

        $svg = "
            <svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'>
                <defs>
                    <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
                        <stop offset='0%' stop-color='{$color1}' />
                        <stop offset='100%' stop-color='{$color2}' />
                    </linearGradient>
                </defs>

                <rect width='100' height='100' fill='url(#grad)' />

                <text
                    x='50'
                    y='55'
                    text-anchor='middle'
                    dominant-baseline='middle'
                    font-family='Sans-serif'
                    font-size='40'
                    font-weight='bold'
                    fill='#fff'
                >
                    {$initials}
                </text>
            </svg>
        ";

        header('Content-Type: image/svg+xml');

        echo $svg;
    }
}