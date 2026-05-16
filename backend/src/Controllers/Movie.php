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

    public function create(): void
    {
        $body = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (
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

            echo json_encode([
                'success' => false,
                'message' => 'Campos faltantes'
            ]);

            return;
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

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo crear la película'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'id' => $id
        ]);
    }

    public function update(
        string $id,
        array $data
    ): void
    {
        $updated = $this->model->update(
            $id,
            $data
        );

        if (!$updated) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo actualizar la película'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Película actualizada correctamente'
        ]);
    }

    public function delete(string $id): void
    {
        $deleted = $this->model->delete($id);

        if (!$deleted) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo eliminar la película'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Película eliminada'
        ]);
    }

    public function findById(): void
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Falta ID'
            ]);

            return;
        }

        $movie = $this->model->getById($id);

        if (!$movie) {

            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Película no encontrada'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'data' => $movie
        ]);
    }

    public function findByTitle(): void
    {
        $title = $_GET['title'] ?? null;

        if (!$title) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Falta el título'
            ]);

            return;
        }

        $movies = $this->model->findByTitle($title);

        if (empty($movies)) {

            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'No se encontraron películas'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'data' => $movies
        ]);
    }

    public function get(): void
    {
        $movies = $this->model->get();

        echo json_encode([
            'success' => true,
            'data' => $movies
        ]);
    }

    public function getActive(): void
    {
        $movies = $this->model->get(true);

        echo json_encode([
            'success' => true,
            'data' => $movies
        ]);
    }

    public function getInactive(): void
    {
        $movies = $this->model->get(false);

        echo json_encode([
            'success' => true,
            'data' => $movies
        ]);
    }
}