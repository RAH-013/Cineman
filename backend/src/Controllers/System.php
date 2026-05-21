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

    public function getBackup(): array
    {
        $new = isset($_GET['new'])
            ? filter_var($_GET['new'], FILTER_VALIDATE_BOOLEAN)
            : false;

        $result = $this->model->getBackup($new);

        if (!$result['success']) {
            http_response_code(500);

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Error generando backup',
                'error' => $result['error'] ?? null
            ];
        }

        $file = $result['file'];

        if (!file_exists($file)) {
            http_response_code(404);

            return [
                'success' => false,
                'message' => 'Archivo no encontrado'
            ];
        }

        return [
            'success' => true,
            'file' => $file,
            'download' => true
        ];
    }

    public function setBackup(): array
    {
        $result = $this->model->setBackup();

        if (!$result['success']) {
            http_response_code(500);

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Error restaurando backup',
                'error' => $result['error'] ?? null
            ];
        }

        return [
            'success' => true,
            'message' => $result['message'],
            'output' => $result['output'] ?? null
        ];
    }

    public function setUsers(): array
    {
        $result = $this->model->setUsersSeed();

        if (!$result['success']) {
            http_response_code(500);

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Error ejecutando seed',
                'error' => $result['error'] ?? null
            ];
        }

        return [
            'success' => true,
            'message' => $result['message'],
            'output' => $result['output'] ?? null
        ];
    }

    public function createLog(): array
    {
        $body = json_decode(file_get_contents('php://input'), true);

        if (
            !$body ||
            !isset($body['action'], $body['message'])
        ) {
            http_response_code(400);

            return [
                'success' => false,
                'message' => 'Datos incompletos'
            ];
        }

        $created = $this->model->createLog($body);

        if (!$created) {
            http_response_code(500);

            return [
                'success' => false,
                'message' => 'No se pudo crear el log'
            ];
        }

        return [
            'success' => true,
            'message' => 'Log creado correctamente'
        ];
    }

    public function getLogs(): array
    {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $logs = $this->model->getLogs($limit, $offset);

        if ($logs === false) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Error interno al recuperar los logs del sistema'
            ];
        }

        return [
            'success' => true,
            'data' => $logs,
            'count' => count($logs)
        ];
    }
}