<?php

namespace Backend\Models;

use Backend\Config\Database;
use DateTime;
use PDO;

class Ticket
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function getOccupiedSeats(
        string $showtimeId,
        string $userId
    ): array {

        $this->expireReservedTickets();

        $stmt = $this->db->prepare("
            SELECT
                seat_row,
                seat_number,
                status,
                id AS ticket_id,
                user_id
            FROM tickets
            WHERE showtime_id = :showtime_id
            AND status IN ('reserved', 'paid')
            ORDER BY seat_row ASC, seat_number ASC
        ");

        $stmt->execute([
            ':showtime_id' => $showtimeId
        ]);

        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($ticket) use ($userId) {

            if ($ticket['user_id'] === $userId) {
                return [
                    'seat_row' => $ticket['seat_row'],
                    'seat_number' => (int) $ticket['seat_number'],
                    'status' => $ticket['status'],
                    'ticket_id' => $ticket['ticket_id']
                ];
            }

            return [
                'seat_row' => $ticket['seat_row'],
                'seat_number' => (int) $ticket['seat_number']
            ];

        }, $tickets);
    }

    public function getByUserId(string $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT
                t.*,
                m.title,
                m.poster_url,
                s.start_time,
                s.room
            FROM tickets t
            INNER JOIN showtimes s
                ON s.id = t.showtime_id
            INNER JOIN movies m
                ON m.id = s.movie_id
            WHERE t.user_id = :user_id
            ORDER BY t.purchased_at DESC
        ");

        $stmt->execute([
            ':user_id' => $userId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function isSeatTaken(
        string $showtimeId,
        string $seatRow,
        int $seatNumber
    ): bool {

        $stmt = $this->db->prepare("
            SELECT id
            FROM tickets
            WHERE showtime_id = :showtime_id
            AND seat_row = :seat_row
            AND seat_number = :seat_number
            AND status IN ('reserved', 'paid')
            AND (
                status = 'paid'
                OR expires_at > NOW()
            )
            LIMIT 1
        ");

        $stmt->execute([
            ':showtime_id' => $showtimeId,
            ':seat_row' => $seatRow,
            ':seat_number' => $seatNumber
        ]);

        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(
        string $id,
        string $userId,
        string $showtimeId,
        string $seatRow,
        int $seatNumber,
        float $totalPrice
    ): array {

        $this->expireReservedTickets();

        if (
            $this->isSeatTaken(
                $showtimeId,
                $seatRow,
                $seatNumber
            )
        ) {
            return [
                'success' => false,
                'message' => 'El asiento ya está ocupado'
            ];
        }

        // Aseguramos la zona horaria correcta para los 5 minutos de reserva
        $timezone = new \DateTimeZone('America/Mexico_City');
        $expiresAt = new \DateTime('now', $timezone);
        $expiresAt->modify('+5 minutes');

        $stmt = $this->db->prepare("
            INSERT INTO tickets (
                id,
                user_id,
                showtime_id,
                seat_row,
                seat_number,
                total_price,
                status,
                expires_at
            )
            VALUES (
                :id,
                :user_id,
                :showtime_id,
                :seat_row,
                :seat_number,
                :total_price,
                :status,
                :expires_at
            )
        ");

        $success = $stmt->execute([
            ':id' => $id,
            ':user_id' => $userId,
            ':showtime_id' => $showtimeId,
            ':seat_row' => $seatRow,
            ':seat_number' => $seatNumber,
            ':total_price' => $totalPrice,
            ':status' => 'reserved',
            ':expires_at' => $expiresAt->format('Y-m-d H:i:s')
        ]);

        return [
            'success' => $success,
            'message' => $success
                ? 'Asiento reservado temporalmente'
                : 'No se pudo reservar el asiento'
        ];
    }

    public function markAsPaid(string $id): bool
    {
        $this->db->beginTransaction();

        try {

            $ticketStmt = $this->db->prepare("
                SELECT
                    showtime_id,
                    status
                FROM tickets
                WHERE id = :id
                LIMIT 1
            ");

            $ticketStmt->execute([
                ':id' => $id
            ]);

            $ticket = $ticketStmt->fetch(PDO::FETCH_ASSOC);

            if (
                !$ticket ||
                $ticket['status'] !== 'reserved'
            ) {
                $this->db->rollBack();
                return false;
            }

            $payStmt = $this->db->prepare("
                UPDATE tickets
                SET status = 'paid'
                WHERE id = :id
            ");

            $payStmt->execute([
                ':id' => $id
            ]);

            if ($payStmt->rowCount() > 0) {

                $showtimeStmt = $this->db->prepare("
                    UPDATE showtimes
                    SET available_seats = available_seats - 1
                    WHERE id = :showtime_id
                    AND available_seats > 0
                ");

                $showtimeStmt->execute([
                    ':showtime_id' => $ticket['showtime_id']
                ]);
            }

            $this->db->commit();

            return true;

        } catch (\Throwable $e) {

            $this->db->rollBack();

            return false;
        }
    }

   public function cancel(string $id): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM tickets
            WHERE id = :id
        ");

        return $stmt->execute([
            ':id' => $id
        ]);
    }

    private function expireReservedTickets(): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM tickets
            WHERE status = 'reserved'
            AND expires_at <= NOW()
        ");

        return $stmt->execute();
    }
}