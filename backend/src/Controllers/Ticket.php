<?php

namespace Backend\Controllers;

use Backend\Models\Ticket as TicketModel;
use Backend\Utils\UUID;

class Ticket
{
    private TicketModel $model;

    public function __construct()
    {
        $this->model = new TicketModel();
    }

    public function getOccupiedSeats(string $userId): array
    {
        $showtimeId = $_GET['showtime_id'] ?? null;

        if (!$showtimeId) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Falta showtime_id'
            ];
        }

        $seats = $this->model->getOccupiedSeats($showtimeId, $userId);

        return [
            'success' => true,
            'data' => $seats
        ];
    }

    public function create(string $userId): array
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (
            !$body || 
            !isset(
                $body['showtime_id'],
                $body['seat_row'],
                $body['seat_number'],
                $body['total_price']
            )
        ) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Campos faltantes o JSON inválido'
            ];
        }

        $id = UUID::generate();

        $result = $this->model->create(
            $id,
            $userId,
            $body['showtime_id'],
            $body['seat_row'],
            (int) $body['seat_number'],
            (float) $body['total_price']
        );

        if (!$result['success']) {
            http_response_code(409);
            return $result;
        }

        return [
            'success' => true,
            'message' => $result['message'],
            'id' => $id
        ];
    }

    public function getByUserId(string $userId): array
    {
        $tickets = $this->model->getByUserId($userId);

        return [
            'success' => true,
            'data' => $tickets
        ];
    }

    public function markAsPaid(string $userId): array
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (!isset($body['id'])) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Falta ID'
            ];
        }

        $success = $this->model->markAsPaid($body['id']);

        if (!$success) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'No se pudo completar el pago'
            ];
        }

        return [
            'success' => true,
            'message' => 'Pago completado correctamente'
        ];
    }

    public function cancel(string $userId): array
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (!isset($body['id'])) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Falta ID'
            ];
        }

        $success = $this->model->cancel($body['id']);

        if (!$success) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'No se pudo cancelar el ticket'
            ];
        }

        return [
            'success' => true,
            'message' => 'Ticket eliminado correctamente'
        ];
    }
}