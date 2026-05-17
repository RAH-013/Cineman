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
            SELECT
                s.*,
                m.title,
                m.poster_url
            FROM showtimes s
            INNER JOIN movies m
                ON m.id = s.movie_id
        ";

        $params = [];

        if ($isActive !== null) {
            $sql .= " WHERE s.is_active = :is_active";
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
            SELECT
                s.*,
                m.title,
                m.poster_url
            FROM showtimes s
            INNER JOIN movies m
                ON m.id = s.movie_id
            WHERE s.id = :id
            AND s.start_time > :current_time
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':id' => $id,
            ':current_time' => $now->format('Y-m-d H:i:s')
        ]);

        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function getByMovieId(
        string $movieId,
        ?bool $isActive = true
    ): array {
        $timezone = new \DateTimeZone('America/Mexico_City');
        $now = new \DateTime('now', $timezone);

        $now->modify('+3 minutes');

        $sql = "
            SELECT
                s.*,
                m.title,
                m.poster_url
            FROM showtimes s
            INNER JOIN movies m
                ON m.id = s.movie_id
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

        $sql .= " ORDER BY s.start_time ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    private function hasConflict(
        string $movieId,
        string $room,
        string $startTime,
        ?string $ignoreId = null
    ): bool {

        $movieStmt = $this->db->prepare("
            SELECT duration_minutes
            FROM movies
            WHERE id = :movie_id
            LIMIT 1
        ");

        $movieStmt->execute([
            ':movie_id' => $movieId
        ]);

        $movie = $movieStmt->fetch(PDO::FETCH_ASSOC);

        if (!$movie) {
            return true;
        }

        $newStart = new DateTime($startTime);

        $newEnd = clone $newStart;
        $newEnd->modify(
            "+" . (int) $movie['duration_minutes'] . " minutes"
        );

        $sql = "
            SELECT
                s.id,
                s.start_time,
                m.duration_minutes
            FROM showtimes s
            INNER JOIN movies m
                ON m.id = s.movie_id
            WHERE s.room = :room
            AND s.is_active = TRUE
        ";

        $params = [
            ':room' => $room
        ];

        if ($ignoreId) {
            $sql .= " AND s.id != :id";
            $params[':id'] = $ignoreId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $showtimes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($showtimes as $showtime) {

            $existingStart = new DateTime(
                $showtime['start_time']
            );

            $existingEnd = clone $existingStart;

            $existingEnd->modify(
                "+" . (int) $showtime['duration_minutes'] . " minutes"
            );

            if (
                $newStart < $existingEnd &&
                $newEnd > $existingStart
            ) {
                return true;
            }
        }

        return false;
    }

    public function create(
        string $id,
        string $movieId,
        string $room,
        string $startTime,
        string $language,
        string $format,
        float $price
    ): array {
        try {
            $timezone = new \DateTimeZone('America/Mexico_City');
            
            $start = new \DateTime($startTime, $timezone);
            $now = new \DateTime('now', $timezone);

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Formato de fecha inválido'
            ];
        }

        if ($start < $now) {
            return [
                'success' => false,
                'message' => 'No puedes crear funciones en el pasado'
            ];
        }

        if (
            $this->hasConflict(
                $movieId,
                $room,
                $startTime
            )
        ) {
            return [
                'success' => false,
                'message' => 'Hay conflicto de horario en la sala seleccionada'
            ];
        }

        $stmt = $this->db->prepare("
            INSERT INTO showtimes (
                id,
                movie_id,
                room,
                start_time,
                language,
                format,
                price,
                available_seats,
                is_active
            )
            VALUES (
                :id,
                :movie_id,
                :room,
                :start_time,
                :language,
                :format,
                :price,
                :available_seats,
                :is_active
            )
        ");

        $success = $stmt->execute([
            ':id' => $id,
            ':movie_id' => $movieId,
            ':room' => $room,
            ':start_time' => $start->format('Y-m-d H:i:s'), 
            ':language' => $language,
            ':format' => $format,
            ':price' => $price,
            ':available_seats' => 50,
            ':is_active' => 1
        ]);

        return [
            'success' => $success,
            'message' => $success
                ? 'Función creada correctamente'
                : 'No se pudo crear la función'
        ];
    }

    public function update(string $id, array $data): array
    {
        $stmt = $this->db->prepare("
            SELECT
                movie_id,
                room,
                start_time
            FROM showtimes
            WHERE id = :id
            LIMIT 1
        ");

        $stmt->execute([
            ':id' => $id
        ]);

        $current = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$current) {
            return [
                'success' => false,
                'message' => 'La función no existe'
            ];
        }

        $movieId = $data['movie_id'] ?? $current['movie_id'];
        $room = $data['room'] ?? $current['room'];
        $startTime = $data['start_time'] ?? $current['start_time'];

        if (
            $this->hasConflict(
                $movieId,
                $room,
                $startTime,
                $id
            )
        ) {
            return [
                'success' => false,
                'message' => 'Hay conflicto de horario en la sala seleccionada'
            ];
        }

        $fields = [];
        $params = [
            ':id' => $id
        ];

        foreach ($data as $key => $value) {

            $fields[] = "{$key} = :{$key}";

            $params[":{$key}"] =
                $key === 'is_active'
                    ? (int) $value
                    : $value;
        }

        if (empty($fields)) {
            return [
                'success' => false,
                'message' => 'No hay datos para actualizar'
            ];
        }

        $sql = "
            UPDATE showtimes
            SET " . implode(', ', $fields) . "
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        $success = $stmt->execute($params);

        return [
            'success' => $success,
            'message' => $success
                ? 'Función actualizada correctamente'
                : 'No se pudo actualizar la función'
        ];
    }

    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM showtimes
            WHERE id = :id
        ");

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}