<?php

namespace Backend\Models;

use Backend\Config\Database;
use DateTime;
use PDO;

class Showtime
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function get(?bool $isActive = null): array
    {
        $sql = "
            SELECT s.*, m.title, m.poster_url,
                   (s.available_seats - (SELECT COUNT(*) FROM tickets t WHERE t.showtime_id = s.id)) AS real_seats
            FROM showtimes s
            INNER JOIN movies m ON m.id = s.movie_id
            HAVING real_seats > 0
        ";
        $params = [];

        if ($isActive !== null) {
            $sql = str_replace("HAVING", "WHERE s.is_active = :is_active HAVING", $sql);
            $params[':is_active'] = (int) $isActive;
        }

        $sql .= " ORDER BY s.start_time ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(string $id): array|false
    {
        $timezone = new \DateTimeZone('America/Mexico_City');
        $now = new \DateTime('now', $timezone);

        $sql = "
            SELECT s.*, m.title, m.poster_url,
                   (s.available_seats - (SELECT COUNT(*) FROM tickets t WHERE t.showtime_id = s.id)) AS real_seats
            FROM showtimes s
            INNER JOIN movies m ON m.id = s.movie_id
            WHERE s.id = :id 
            AND s.is_active = 1 
            AND s.start_time > :current_time
            HAVING real_seats > 0
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':current_time' => $now->format('Y-m-d H:i:s')
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByMovieId(string $movieId, ?bool $isActive = true): array 
    {
        $timezone = new \DateTimeZone('America/Mexico_City');
        $now = new \DateTime('now', $timezone);
        $now->modify('+3 minutes');

        $sql = "
            SELECT s.*, m.title, m.poster_url,
                   (s.available_seats - (SELECT COUNT(*) FROM tickets t WHERE t.showtime_id = s.id)) AS real_seats
            FROM showtimes s
            INNER JOIN movies m ON m.id = s.movie_id
            WHERE s.movie_id = :movie_id 
            AND s.start_time > :current_time
        ";

        $params = [
            ':movie_id' => $movieId,
            ':current_time' => $now->format('Y-m-d H:i:s')
        ];

        if ($isActive !== null) {
            $sql .= " AND s.is_active = :is_active";
            $params[':is_active'] = (int) $isActive;
        }

        $sql .= " HAVING real_seats > 0 ORDER BY s.start_time ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getNextByMovieId(string $movieId): ?array
    {
        $timezone = new \DateTimeZone('America/Mexico_City');
        $now = new \DateTime('now', $timezone);

        $sql = "
            SELECT s.*, m.title, m.poster_url,
                DATE_FORMAT(s.start_time, '%h:%i %p') AS formatted_time,
                (s.available_seats - (SELECT COUNT(*) FROM tickets t WHERE t.showtime_id = s.id)) AS real_seats
            FROM showtimes s
            INNER JOIN movies m ON m.id = s.movie_id
            WHERE s.movie_id = :movie_id
            AND s.is_active = 1
            AND s.start_time > :current_time
            HAVING real_seats > 0
            ORDER BY s.start_time ASC
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':movie_id' => $movieId,
            ':current_time' => $now->format('Y-m-d H:i:s')
        ]);

        $showtime = $stmt->fetch(PDO::FETCH_ASSOC);
        return $showtime ?: null;
    }

    public function findByDayAndHours(int $day, array $hours, ?int $minutes = null): array
    {
        $timezone = new \DateTimeZone('America/Mexico_City');
        $now = new \DateTime('now', $timezone);

        $sql = "
            SELECT s.*, m.title, m.poster_url,
                   DATE_FORMAT(s.start_time, '%Y-%m-%d') AS date,
                   DATE_FORMAT(s.start_time, '%H:%i:%s') AS time,
                   DATE_FORMAT(s.start_time, '%h:%i %p') AS formatted_time,
                   (s.available_seats - (SELECT COUNT(*) FROM tickets t WHERE t.showtime_id = s.id)) AS real_seats
            FROM showtimes s
            INNER JOIN movies m ON m.id = s.movie_id
            WHERE s.is_active = 1 
            AND m.is_active = 1
            AND s.start_time > :current_time
            AND DAY(s.start_time) = :day
        ";

        $params = [
            ':current_time' => $now->format('Y-m-d H:i:s'),
            ':day' => $day
        ];

        if (!empty($hours)) {
            $inQuery = implode(',', array_map('intval', $hours));
            $sql .= " AND HOUR(s.start_time) IN ($inQuery)";
        }

        if ($minutes !== null && $minutes !== 0) {
            $sql .= " AND MINUTE(s.start_time) = :minutes";
            $params[':minutes'] = $minutes;
        }

        $sql .= " HAVING real_seats > 0 ORDER BY s.start_time ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findNextByTimePreference(string $preference): ?array
    {
        $timezone = new \DateTimeZone('America/Mexico_City');
        $now = new \DateTime('now', $timezone);

        $sql = "
            SELECT s.*, m.title, m.poster_url, m.id AS movie_id,
                   DATE_FORMAT(s.start_time, '%Y-%m-%d') AS date,
                   DATE_FORMAT(s.start_time, '%H:%i:%s') AS time,
                   DATE_FORMAT(s.start_time, '%h:%i %p') AS formatted_time,
                   (s.available_seats - (SELECT COUNT(*) FROM tickets t WHERE t.showtime_id = s.id)) AS real_seats
            FROM showtimes s
            INNER JOIN movies m ON m.id = s.movie_id
            WHERE s.is_active = 1 
            AND m.is_active = 1
            AND s.start_time > :current_time
        ";

        if ($preference === 'mañana') {
            $sql .= " AND HOUR(s.start_time) < 12";
        } elseif ($preference === 'tarde') {
            $sql .= " AND HOUR(s.start_time) >= 12 AND HOUR(s.start_time) < 19";
        } elseif ($preference === 'noche') {
            $sql .= " AND HOUR(s.start_time) >= 19";
        }

        $sql .= " HAVING real_seats > 0 ORDER BY s.start_time ASC LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':current_time' => $now->format('Y-m-d H:i:s')]);
        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }

    private function hasConflict(string $movieId, string $room, string $startTime, ?string $ignoreId = null): bool 
    {
        $movieStmt = $this->db->prepare("SELECT duration_minutes FROM movies WHERE id = :movie_id LIMIT 1");
        $movieStmt->execute([':movie_id' => $movieId]);
        $movie = $movieStmt->fetch(PDO::FETCH_ASSOC);

        if (!$movie) return true;

        $newStart = new DateTime($startTime);
        $newEnd = clone $newStart;
        $newEnd->modify("+" . (int) $movie['duration_minutes'] . " minutes");

        $sql = "
            SELECT s.id, s.start_time, m.duration_minutes
            FROM showtimes s
            INNER JOIN movies m ON m.id = s.movie_id
            WHERE s.room = :room AND s.is_active = TRUE
        ";
        $params = [':room' => $room];

        if ($ignoreId) {
            $sql .= " AND s.id != :id";
            $params[':id'] = $ignoreId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $showtimes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($showtimes as $showtime) {
            $existingStart = new DateTime($showtime['start_time']);
            $existingEnd = clone $existingStart;
            $existingEnd->modify("+" . (int) $showtime['duration_minutes'] . " minutes");

            if ($newStart < $existingEnd && $newEnd > $existingStart) {
                return true;
            }
        }
        return false;
    }

    public function create(string $id, string $movieId, string $room, string $startTime, string $language, string $format, float $price): array 
    {
        try {
            $timezone = new \DateTimeZone('America/Mexico_City');
            $start = new \DateTime($startTime, $timezone);
            $now = new \DateTime('now', $timezone);
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Formato de fecha inválido'];
        }

        if ($start < $now) {
            return ['success' => false, 'message' => 'No puedes crear funciones en el pasado'];
        }

        if ($this->hasConflict($movieId, $room, $startTime)) {
            return ['success' => false, 'message' => 'Hay conflicto de horario en la sala seleccionada'];
        }

        $stmt = $this->db->prepare("
            INSERT INTO showtimes (id, movie_id, room, start_time, language, format, price, available_seats, is_active)
            VALUES (:id, :movie_id, :room, :start_time, :language, :format, :price, :available_seats, :is_active)
        ");

        $success = $stmt->execute([
            ':id' => $id, ':movie_id' => $movieId, ':room' => $room,
            ':start_time' => $start->format('Y-m-d H:i:s'), ':language' => $language,
            ':format' => $format, ':price' => $price, ':available_seats' => 50, ':is_active' => 1
        ]);

        return [
            'success' => $success,
            'message' => $success ? 'Función creada correctamente' : 'No se pudo crear la función'
        ];
    }

    public function update(string $id, array $data): array
    {
        $stmt = $this->db->prepare("SELECT movie_id, room, start_time FROM showtimes WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $current = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$current) {
            return ['success' => false, 'message' => 'La función no existe'];
        }

        $movieId = $data['movie_id'] ?? $current['movie_id'];
        $room = $data['room'] ?? $current['room'];
        $startTime = $data['start_time'] ?? $current['start_time'];

        if ($this->hasConflict($movieId, $room, $startTime, $id)) {
            return ['success' => false, 'message' => 'Hay conflicto de horario en la sala seleccionada'];
        }

        $fields = [];
        $params = [':id' => $id];
        $allowed = ['movie_id', 'room', 'start_time', 'language', 'format', 'price', 'is_active'];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $fields[] = "{$field} = :{$field}";
                $params[":{$field}"] = $field === 'is_active' ? (int)$data[$field] : $data[$field];
            }
        }

        if (empty($fields)) {
            return ['success' => false, 'message' => 'No hay datos para actualizar'];
        }

        $sql = "UPDATE showtimes SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute($params);

        return [
            'success' => $success,
            'message' => $success ? 'Función actualizada correctamente' : 'No se pudo actualizar la función'
        ];
    }

    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM showtimes WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}