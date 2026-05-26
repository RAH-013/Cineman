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
        $sql = "SELECT * FROM movies";
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

    public function getById(string $id): ?array
    {
        $sql = "SELECT * FROM movies WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    public function findByTitle(string $title): array|false
    {
        $sql = "
            SELECT * FROM movies
            WHERE is_active = 1 AND title LIKE :title
            ORDER BY created_at DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':title' => "%$title%"]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findOneByTitle(string $message): ?array
    {
        $message = mb_strtolower(trim($message));

        $sql = "
            SELECT *
            FROM movies
            WHERE is_active = 1
            AND LOWER(title) LIKE :title
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':title' => "%{$message}%"
        ]);

        $movie = $stmt->fetch(PDO::FETCH_ASSOC);

        return $movie ?: null;
    }

    public function getRandomByGenre(string $genre): ?array
    {
        $sql = "
            SELECT *
            FROM movies
            WHERE is_active = 1
            AND genres LIKE :genre
            ORDER BY RAND()
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':genre' => "%{$genre}%"
        ]);

        $movie = $stmt->fetch(PDO::FETCH_ASSOC);

        return $movie ?: null;
    }

    public function getRandomRecommendation(): ?array
    {
        $sql = "
            SELECT *
            FROM movies
            WHERE is_active = 1
            ORDER BY RAND()
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute();

        $movie = $stmt->fetch(PDO::FETCH_ASSOC);

        return $movie ?: null;
    }

    public function searchActiveMovies(array $filters): array
    {
        $sql = "SELECT DISTINCT m.* FROM movies m";
        
        $conditions = ["m.is_active = 1"];
        $params = [];

        if (!empty($filters['language']) || !empty($filters['format']) || !empty($filters['time_condition'])) {
            $sql .= " INNER JOIN showtimes s ON m.id = s.movie_id";
            $conditions[] = "s.is_active = 1";
            
            if (!empty($filters['language'])) {
                $conditions[] = "s.language = ?";
                $params[] = $filters['language'];
            }
            
            if (!empty($filters['format'])) {
                $conditions[] = "s.format = ?";
                $params[] = $filters['format'];
            }
        }

        if (!empty($filters['genre'])) {
            $conditions[] = "FIND_IN_SET(?, m.genres) > 0";
            $params[] = $filters['genre'];
        }

        if (!empty($filters['classification'])) {
            $conditions[] = "m.classification = ?";
            $params[] = $filters['classification'];
        }

        $sql .= " WHERE " . implode(" AND ", $conditions);

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];
    }

    public function create(
        string $id, string $title, string $director, string $synopsis,
        string $posterUrl, string $trailerUrl, int $durationMinutes,
        string $classification, string $genres, string $releaseDate, bool $isActive = true
    ): bool {
        $sql = "
            INSERT INTO movies (id, title, director, synopsis, poster_url, trailer_url, duration_minutes, classification, genres, release_date, is_active)
            VALUES (:id, :title, :director, :synopsis, :poster_url, :trailer_url, :duration_minutes, :classification, :genres, :release_date, :is_active)
        ";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id, ':title' => $title, ':director' => $director, ':synopsis' => $synopsis,
            ':poster_url' => $posterUrl, ':trailer_url' => $trailerUrl, ':duration_minutes' => $durationMinutes,
            ':classification' => $classification, ':genres' => $genres, ':release_date' => $releaseDate, ':is_active' => $isActive
        ]);
    }

    public function update(string $id, array $data): bool
    {
        $fields = [];
        $params = [':id' => $id];

        $allowed = ['title', 'director', 'synopsis', 'poster_url', 'trailer_url', 'duration_minutes', 'classification', 'genres', 'release_date', 'is_active'];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $field === 'is_active' ? (int)$data[$field] : $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE movies SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(string $id): bool
    {
        $sql = "DELETE FROM movies WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}