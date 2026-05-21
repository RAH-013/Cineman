<?php

namespace Backend\Controllers;

use Backend\Models\Movie as MovieModel;
use Backend\Utils\UUID;

class Movie
{
    private MovieModel $model;

    public function __construct()
    {
        $this->model = new MovieModel();
    }

    public function create(): array
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (
            !$body ||
            !isset(
                $body['title'],
                $body['director'],
                $body['synopsis'],
                $body['poster_url'],
                $body['trailer_url'],
                $body['duration_minutes'],
                $body['classification'],
                $body['genres'],
                $body['release_date']
            )
        ) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Campos faltantes o JSON inválido'
            ];
        }

        $id = UUID::generate();

        $created = $this->model->create(
            $id,
            $body['title'],
            $body['director'],
            $body['synopsis'],
            $body['poster_url'],
            $body['trailer_url'],
            (int) $body['duration_minutes'],
            $body['classification'],
            $body['genres'],
            $body['release_date'],
            $body['is_active'] ?? true
        );

        if (!$created) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'No se pudo crear la película'
            ];
        }

        return [
            'success' => true,
            'id' => $id
        ];
    }

    public function update(string $id, array $data): array
    {
        $updated = $this->model->update($id, $data);

        if (!$updated) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'No se pudo actualizar la película'
            ];
        }

        return [
            'success' => true,
            'message' => 'Película actualizada correctamente'
        ];
    }

    public function delete(string $id): array
    {
        $deleted = $this->model->delete($id);

        if (!$deleted) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'No se pudo eliminar la película'
            ];
        }

        return [
            'success' => true,
            'message' => 'Película eliminada'
        ];
    }

    public function findById(?string $id = null): array
    {
        $id = $id ?? ($_GET['id'] ?? null);

        if (!$id) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Falta ID'
            ];
        }

        $movie = $this->model->getById($id);

        if (!$movie) {
            http_response_code(404);
            return [
                'success' => false,
                'message' => 'Película no encontrada'
            ];
        }

        return [
            'success' => true,
            'data' => $movie
        ];
    }

    public function findActiveById(): array
    {
        $response = $this->findById();

        if (!$response['success']) {
            return $response;
        }

        $movie = $response['data'];

        if (isset($movie['is_active']) && (bool)$movie['is_active'] === false) {
            http_response_code(404);
            return [
                'success' => false,
                'message' => 'Película no encontrada'
            ];
        }

        return $response;
    }

    public function get(): array
    {
        return [
            'success' => true,
            'data' => $this->model->get()
        ];
    }

    public function getActive(): array
    {
        return [
            'success' => true,
            'data' => $this->model->get(true)
        ];
    }
}