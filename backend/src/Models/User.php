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
            WHERE users.id != :id
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

    public function getAvatar(string $userId, bool $icon): void
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

        $svgContent = '';

        if (!empty(trim($user['name'] ?? ''))) {
            $initials = strtoupper($user['name'][0]) . strtoupper($user['lastname'][0] ?? '');
            
            $svgContent = "
                <text x='50' y='55' text-anchor='middle' dominant-baseline='middle' font-family='Sans-serif' font-size='40' font-weight='bold' fill='#fff'>
                    {$initials}
                </text>";
                
        } elseif (!empty(trim($user['lastname'] ?? ''))) {
            $initials = strtoupper($user['lastname'][0]);
            
            $svgContent = "
                <text x='50' y='55' text-anchor='middle' dominant-baseline='middle' font-family='Sans-serif' font-size='40' font-weight='bold' fill='#fff'>
                    {$initials}
                </text>";
                
        } elseif ($icon) {
            $svgContent = "
                <svg x='20' y='20' width='60' height='60' viewBox='0 0 640 640' fill='#ffffff'>
                    <path d='M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z'/>
                </svg>";
        } else {
            $svgContent = "
                <text x='50' y='55' text-anchor='middle' dominant-baseline='middle' font-family='Sans-serif' font-size='40' font-weight='bold' fill='#fff'>
                    YO
                </text>";
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
                
                {$svgContent}
            </svg>
        ";

        header('Content-Type: image/svg+xml');

        echo trim($svg);
    }
}