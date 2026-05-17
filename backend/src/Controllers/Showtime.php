<?php

namespace Backend\Controllers;

use Backend\Models\Showtime as ShowtimeModel;
use Backend\Utils\UUID;

class Showtime
{
    private ShowtimeModel $model;

    public function __construct()
    {
        $this->model = new ShowtimeModel();
    }

    public function create(): void
    {
        $body = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (
            !isset(
                $body['movie_id'],
                $body['room'],
                $body['start_time'],
                $body['language'],
                $body['format'],
                $body['price']
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
            $body['movie_id'],
            $body['room'],
            $body['start_time'],
            $body['language'],
            $body['format'],
            (float) $body['price']
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

    public function update(
        string $id,
        array $data
    ): void {

        $result = $this->model->update(
            $id,
            $data
        );

        if (!$result['success']) {

            http_response_code(409);

            echo json_encode($result);

            return;
        }

        echo json_encode($result);
    }

    public function delete(string $id): void
    {
        $deleted = $this->model->delete($id);

        if (!$deleted) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo eliminar la función'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Función eliminada'
        ]);
    }

    public function findByMovieId(string $id): void
    {
        $showtimes = $this->model->getByMovieId($id);

        echo json_encode([
            'success' => true,
            'data' => $showtimes
        ]);
    }

    public function findById(string $id): void
    {
        $showtimes = $this->model->getById($id);

        echo json_encode([
            'success' => true,
            'data' => $showtimes
        ]);
    }

    public function get(): void
    {
        $showtimes = $this->model->get();

        echo json_encode([
            'success' => true,
            'data' => $showtimes
        ]);
    }
}