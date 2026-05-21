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
        $stmt->execute([':id' => $excludeId]);

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
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByEmail(string $email): array|false
    {
        $sql = "
            SELECT id, email, password, role 
            FROM users 
            WHERE email = :email 
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(
        string $id,
        string $email,
        string $password,
        string $role = 'user'
    ): bool {
        try {
            $this->db->beginTransaction();

            $this->db->prepare("
                INSERT INTO users (id, email, password, role)
                VALUES (:id, :email, :password, :role)
            ")->execute([
                ':id' => $id,
                ':email' => $email,
                ':password' => password_hash($password, PASSWORD_BCRYPT),
                ':role' => $role
            ]);

            $this->db->prepare("
                INSERT INTO user_profiles (user_id)
                VALUES (:user_id)
            ")->execute([
                ':user_id' => $id
            ]);

            $this->db->commit();
            return true;

        } catch (\Throwable $e) {
            $this->db->rollBack();
            return false;
        }
    }

    public function update(string $id, array $data): bool
    {
        try {
            $this->db->beginTransaction();

            $userFields = [];
            $userParams = [':id' => $id];

            if (isset($data['email'])) {
                $userFields[] = "email = :email";
                $userParams[':email'] = $data['email'];
            }

           if (isset($data['password']) && trim($data['password']) !== '') {
                $userFields[] = "password = :password";
                $userParams[':password'] = password_hash($data['password'], PASSWORD_BCRYPT);
            }

            if (isset($data['role'])) {
                $userFields[] = "role = :role";
                $userParams[':role'] = $data['role'];
            }

            if ($userFields) {
                $sql = "
                    UPDATE users
                    SET " . implode(', ', $userFields) . "
                    WHERE id = :id
                ";
                $this->db->prepare($sql)->execute($userParams);
            }

            $profileFields = [];
            $profileParams = [':user_id' => $id];

            if (isset($data['name'])) {
                $profileFields[] = "name = :name";
                $profileParams[':name'] = $data['name'];
            }

            if (isset($data['lastname'])) {
                $profileFields[] = "lastname = :lastname";
                $profileParams[':lastname'] = $data['lastname'];
            }

            if (isset($data['phone'])) {
                $profileFields[] = "phone = :phone";
                $profileParams[':phone'] = $data['phone'];
            }

            if ($profileFields) {
                $sql = "
                    UPDATE user_profiles
                    SET " . implode(', ', $profileFields) . "
                    WHERE user_id = :user_id
                ";
                $this->db->prepare($sql)->execute($profileParams);
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
        try {
            $this->db->beginTransaction();
            
            $this->db->prepare("DELETE FROM user_profiles WHERE user_id = :id")->execute([':id' => $id]);
            $success = $this->db->prepare("DELETE FROM users WHERE id = :id")->execute([':id' => $id]);
            
            $this->db->commit();
            return $success;
        } catch (\Throwable $e) {
            $this->db->rollBack();
            return false;
        }
    }

    public function getAvatarData(string $id): array|false
    {
        $sql = "
            SELECT 
                u.id, 
                p.name, 
                p.lastname 
            FROM users u
            LEFT JOIN user_profiles p 
                ON p.user_id = u.id
            WHERE u.id = :id 
            LIMIT 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}