<?php

namespace Backend\Models;

use Backend\Config\Database;
use PDO;

class System
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function getBackup(bool $new = false): array
    {
        $script = __DIR__ . '/../../scripts/db_backup.sh';
        $backupDir = __DIR__ . '/../../backups';

        $latestFile = null;

        if (!$new && is_dir($backupDir)) {
            $files = glob($backupDir . '/*.sql.gz');

            if (!empty($files)) {
                usort($files, fn($a, $b) => filemtime($b) <=> filemtime($a));
                $latestFile = $files[0];
            }
        }

        if (!$new && $latestFile) {
            return [
                'success' => true,
                'file' => $latestFile,
                'cached' => true
            ];
        }

        $process = proc_open(
            "bash " . escapeshellarg($script),
            [
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w']
            ],
            $pipes
        );

        if (!is_resource($process)) {
            return [
                'success' => false,
                'message' => 'No se pudo ejecutar el script'
            ];
        }

        $output = stream_get_contents($pipes[1]);
        $error  = stream_get_contents($pipes[2]);

        fclose($pipes[1]);
        fclose($pipes[2]);

        $code = proc_close($process);

        if ($code !== 0) {
            return [
                'success' => false,
                'message' => 'Error generando backup',
                'error' => $error
            ];
        }

        $filePath = trim($output);

        if (!$filePath || !file_exists($filePath)) {
            return [
                'success' => false,
                'message' => 'Backup no generado correctamente'
            ];
        }

        return [
            'success' => true,
            'file' => $filePath,
            'cached' => false
        ];
    }

    public function getServerHtop(): array
    {
        $script = __DIR__ . '/../../scripts/server_htop.sh';

        $process = proc_open(
            "bash " . escapeshellarg($script),
            [
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w']
            ],
            $pipes
        );

        if (!is_resource($process)) {
            return [
                'success' => false,
                'message' => 'No se pudo ejecutar el script'
            ];
        }

        $output = stream_get_contents($pipes[1]);
        $error  = stream_get_contents($pipes[2]);

        fclose($pipes[1]);
        fclose($pipes[2]);

        $code = proc_close($process);

        if ($code !== 0) {
            return [
                'success' => false,
                'message' => 'Error ejecutando server_htop.sh',
                'error' => trim($error)
            ];
        }

        return [
            'success' => true,
            'output' => trim($output)
        ];
    }

    public function setBackup(): array
    {
        $script = __DIR__ . '/../../scripts/db_restore.sh';

        $process = proc_open(
            "bash " . escapeshellarg($script),
            [
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w']
            ],
            $pipes
        );

        if (!is_resource($process)) {
            return [
                'success' => false,
                'message' => 'No se pudo ejecutar el script'
            ];
        }

        $output = stream_get_contents($pipes[1]);
        $error  = stream_get_contents($pipes[2]);

        fclose($pipes[1]);
        fclose($pipes[2]);

        $code = proc_close($process);

        if ($code !== 0) {
            return [
                'success' => false,
                'message' => 'Error restaurando backup',
                'error' => trim($error)
            ];
        }

        return [
            'success' => true,
            'message' => 'Backup restaurado correctamente',
            'output' => trim($output)
        ];
    }

    public function setUsersSeed(): array
    {
        $script = __DIR__ . '/../../scripts/seed_users.sh';

        if (!file_exists($script)) {

            return [
                'success' => false,
                'message' => 'Script no encontrado'
            ];
        }

        $process = proc_open(
            "bash " . escapeshellarg($script),
            [
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w']
            ],
            $pipes
        );

        if (!is_resource($process)) {

            return [
                'success' => false,
                'message' => 'No se pudo ejecutar el script'
            ];
        }

        $output = stream_get_contents($pipes[1]);
        $error = stream_get_contents($pipes[2]);

        fclose($pipes[1]);
        fclose($pipes[2]);

        $code = proc_close($process);

        if ($code !== 0) {

            return [
                'success' => false,
                'message' => 'Error ejecutando seed',
                'error' => trim($error)
            ];
        }

        return [
            'success' => true,
            'message' => 'Usuarios generados correctamente',
            'output' => trim($output)
        ];
    }

    public function getLogs(int $limit = 100, int $offset = 0): array
    {
        try {
            $sql = "
                SELECT *
                FROM logs
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :offset
            ";

            $stmt = $this->db->prepare($sql);
            
            $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
            
            $stmt->execute();

            $logs = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            foreach ($logs as &$log) {
                $log['context'] = !empty($log['context'])
                    ? json_decode($log['context'], true)
                    : null;
            }

            return $logs;

        } catch (\Throwable $e) {
            return [];
        }
    }

    public function createLog(array $data): bool
    {
        $sql = "
            INSERT INTO logs (
                request_id,
                token_jti,
                user_id,
                user_role,
                action,
                severity,
                ip_address,
                user_agent,
                endpoint,
                method,
                status_code,
                message,
                context
            )
            VALUES (
                :request_id,
                :token_jti,
                :user_id,
                :user_role,
                :action,
                :severity,
                :ip_address,
                :user_agent,
                :endpoint,
                :method,
                :status_code,
                :message,
                :context
            )
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':request_id'  => $data['request_id'] ?? null,
            ':token_jti'   => $data['token_jti'] ?? null,
            ':user_id'     => $data['user_id'] ?? null,
            ':user_role'   => $data['user_role'] ?? null,
            ':action'      => $data['action'],
            ':severity'    => $data['severity'] ?? 'info',
            ':ip_address'  => $data['ip_address'] ?? null,
            ':user_agent'  => $data['user_agent'] ?? null,
            ':endpoint'    => $data['endpoint'] ?? null,
            ':method'      => $data['method'] ?? null,
            ':status_code' => $data['status_code'] ?? null,
            ':message'     => $data['message'],
            ':context'     => isset($data['context'])
                ? json_encode($data['context'], JSON_UNESCAPED_UNICODE)
                : null
        ]);
    }
}