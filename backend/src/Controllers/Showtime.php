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

    public function create(): array
    {
        $body = json_decode(file_get_contents('php://input'), true);

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

            return [
                'success' => false,
                'message' => 'Campos faltantes'
            ];
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

            return $result;
        }

        return [
            'success' => true,
            'message' => $result['message'],
            'id' => $id
        ];
    }

    public function update(string $id, array $data): array
    {
        $result = $this->model->update($id, $data);

        if (!$result['success']) {
            http_response_code(409);

            return $result;
        }

        return $result;
    }

    public function delete(string $id): array
    {
        $deleted = $this->model->delete($id);

        if (!$deleted) {
            http_response_code(500);

            return [
                'success' => false,
                'message' => 'No se pudo eliminar la función'
            ];
        }

        return [
            'success' => true,
            'message' => 'Función eliminada'
        ];
    }

    public function findByMovieId(string $id): array
    {
        return [
            'success' => true,
            'data' => $this->model->getByMovieId($id)
        ];
    }

    public function findById(string $id): array
    {
        return [
            'success' => true,
            'data' => $this->model->getById($id)
        ];
    }

    public function get(): array
    {
        return [
            'success' => true,
            'data' => $this->model->get()
        ];
    }
}