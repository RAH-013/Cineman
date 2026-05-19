<?php

namespace Backend\Models;

use Backend\Config\Database;
use PDO;

class Movie
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function get(?bool $isActive = null): array
    {
        $sql = "
            SELECT
            *
            FROM movies
        ";

        $params = [];

        if ($isActive !== null) {
            $sql .= " WHERE is_active = :is_active ";
            $params[':is_active'] = (int) $isActive;
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(string $id): array|false
    {
        $sql = "
            SELECT
            *
            FROM movies
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByTitle(string $title): array|false
    {
        $sql = "
            SELECT *
            FROM movies
            WHERE is_active = 1
            AND title LIKE :title
            ORDER BY created_at DESC
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':title' => "%$title%"
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(
        string $id,
        string $title,
        string $director,
        string $synopsis,
        string $posterUrl,
        string $trailerUrl,
        int $durationMinutes,
        string $classification,
        string $genres,
        string $releaseDate,
        bool $isActive = true
    ): bool {

        $sql = "
            INSERT INTO movies (
                id,
                title,
                director,
                synopsis,
                poster_url,
                trailer_url,
                duration_minutes,
                classification,
                genres,
                release_date,
                is_active
            )
            VALUES (
                :id,
                :title,
                :director,
                :synopsis,
                :poster_url,
                :trailer_url,
                :duration_minutes,
                :classification,
                :genres,
                :release_date,
                :is_active
            )
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':director' => $director,
            ':synopsis' => $synopsis,
            ':poster_url' => $posterUrl,
            ':trailer_url' => $trailerUrl,
            ':duration_minutes' => $durationMinutes,
            ':classification' => $classification,
            ':genres' => $genres,
            ':release_date' => $releaseDate,
            ':is_active' => $isActive
        ]);
    }

    public function update(
        string $id,
        array $data
    ): bool {

        $fields = [];
        $params = [
            ':id' => $id
        ];

        if (isset($data['title'])) {
            $fields[] = 'title = :title';
            $params[':title'] = $data['title'];
        }

        if (isset($data['synopsis'])) {
            $fields[] = 'synopsis = :synopsis';
            $params[':synopsis'] = $data['synopsis'];
        }

        if (isset($data['poster_url'])) {
            $fields[] = 'poster_url = :poster_url';
            $params[':poster_url'] = $data['poster_url'];
        }

        if (isset($data['duration_minutes'])) {
            $fields[] = 'duration_minutes = :duration_minutes';
            $params[':duration_minutes'] = $data['duration_minutes'];
        }

        if (isset($data['classification'])) {
            $fields[] = 'classification = :classification';
            $params[':classification'] = $data['classification'];
        }

        if (isset($data['genres'])) {
            $fields[] = 'genres = :genres';
            $params[':genres'] = $data['genres'];
        }

        if (isset($data['release_date'])) {
            $fields[] = 'release_date = :release_date';
            $params[':release_date'] = $data['release_date'];
        }

        if (isset($data['is_active'])) {
            $fields[] = 'is_active = :is_active';
            $params[':is_active'] = $data['is_active'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "
            UPDATE movies
            SET " . implode(', ', $fields) . "
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($params);
    }

    public function delete(string $id): bool
    {
        $sql = "
            DELETE FROM movies
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}