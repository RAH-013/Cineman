<?php

namespace Backend\Controllers;

use Backend\Models\System as SystemModel;

class System
{
    private SystemModel $model;

    public function __construct()
    {
        $this->model = new SystemModel();
    }

    public function getBackup(): void
    {
        $new = isset($_GET['new'])
            ? filter_var($_GET['new'], FILTER_VALIDATE_BOOLEAN)
            : false;

        $result = $this->model->getBackup($new);

        if (!$result['success']) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => $result['message'] ?? 'Error generando backup',
                'error' => $result['error'] ?? null
            ]);

            return;
        }

        $file = $result['file'];

        if (!file_exists($file)) {

            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Archivo no encontrado'
            ]);

            return;
        }

        header('Content-Type: application/gzip');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Content-Length: ' . filesize($file));
        header('Cache-Control: no-cache');
        header('Pragma: no-cache');

        readfile($file);

        exit;
    }

    public function setBackup(): void
    {
        $result = $this->model->setBackup();

        if (!$result['success']) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => $result['message'] ?? 'Error restaurando backup',
                'error' => $result['error'] ?? null
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => $result['message'],
            'output' => $result['output'] ?? null
        ]);
    }

    public function setUsers(): void
    {
        $result = $this->model->setUsersSeed();

        if (!$result['success']) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => $result['message'] ?? 'Error ejecutando seed',
                'error' => $result['error'] ?? null
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => $result['message'],
            'output' => $result['output'] ?? null
        ]);
    }

    public function createLog(): void
    {
        $body = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (
            !$body ||
            !isset(
                $body['action'],
                $body['message']
            )
        ) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Datos incompletos'
            ]);

            return;
        }

        $created = $this->model->createLog($body);

        if (!$created) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'No se pudo crear el log'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Log creado correctamente'
        ]);
    }
}