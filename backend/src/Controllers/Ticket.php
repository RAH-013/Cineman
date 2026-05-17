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

    public function getOccupiedSeats(string $id): void
    {
        $showtimeId = $_GET['showtime_id'] ?? null;

        if (!$showtimeId) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Falta showtime_id'
            ]);

            return;
        }

        $seats = $this->model->getOccupiedSeats(
            $showtimeId,
            $id
        );

        echo json_encode([
            'success' => true,
            'data' => $seats
        ]);
    }

    public function create(string $userId): void
    {
        $body = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (
            !isset(
                $body['showtime_id'],
                $body['seat_row'],
                $body['seat_number'],
                $body['total_price']
            )
        ) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Campos faltantes'
            ]);

            return;
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

            echo json_encode($result);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => $result['message'],
            'id' => $id
        ]);
    }

    public function getByUserId(string $userId): void
    {
        $tickets = $this->model->getByUserId($userId);

        echo json_encode([
            'success' => true,
            'data' => $tickets
        ]);
    }

    public function markAsPaid(string $userId): void
    {
        $body = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!isset($body['id'])) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Falta ID'
            ]);

            return;
        }

        $success = $this->model->markAsPaid(
            $body['id']
        );

        if (!$success) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo completar el pago'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Pago completado correctamente'
        ]);
    }

    public function cancel(string $userId): void
    {
        $body = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!isset($body['id'])) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Falta ID'
            ]);

            return;
        }

        $success = $this->model->cancel(
            $body['id']
        );

        if (!$success) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo cancelar el ticket'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Ticket eliminado correctamente'
        ]);
    }
}