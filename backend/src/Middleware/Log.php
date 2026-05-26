<?php

namespace Backend\Middleware;

use Backend\Models\System as SystemModel;
use Backend\Middleware\Auth;

class Log
{
    private SystemModel $system;

    public function __construct()
    {
        $this->system = new SystemModel();
    }

    public function handle(callable $next)
    {
        $request = $this->captureRequest();

        try {
            $response = $next($request);
        } catch (\Throwable $e) {
            $this->writeLog($request, null, $e);
            throw $e;
        }

        $this->writeLog($request, $response);

        return $response;
    }

    private function captureRequest(): array
    {
        return [
            'request_id' => $_SERVER['HTTP_X_REQUEST_ID'] ?? uniqid('req_', true),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'endpoint'   => $_SERVER['REQUEST_URI'] ?? null,
            'method'     => $_SERVER['REQUEST_METHOD'] ?? null,
        ];
    }

    private function writeLog(
        array $request,
        mixed $response,
        ?\Throwable $exception = null,
        ?array $currentUser = null
    ): void {
        try {
            $statusCode = http_response_code();

            if ($statusCode === false || $statusCode === 200) {
                $statusCode = is_array($response) && isset($response['status_code'])
                    ? (int) $response['status_code']
                    : 200;
            }

            $this->system->createLog([
                'request_id' => $request['request_id'],
                'user_id'    => $currentUser['id'] ?? null,
                'user_role'  => $currentUser['role'] ?? null,
                'token_jti'  => $currentUser['jti'] ?? null,

                'action'     => $this->resolveAction($request),
                'severity'   => $this->resolveSeverity($statusCode),
                'ip_address' => $request['ip_address'],
                'user_agent' => $request['user_agent'],
                'endpoint'   => $request['endpoint'],
                'method'     => $request['method'],
                'status_code'=> $statusCode,

                'message'    => $exception
                    ? 'Error: ' . $exception->getMessage()
                    : $this->resolveMessage($statusCode),

                'context' => [
                    'response_type' => gettype($response),
                    'exception'     => $exception ? get_class($exception) : null
                ]
            ]);
        } catch (\Throwable $logError) {}
    }

    private function resolveAction(array $request): string
    {
        return trim($request['method'] . '_' . explode('?', $request['endpoint'])[0]);
    }

    private function resolveSeverity(int $statusCode): string
    {
        return match (true) {
            $statusCode >= 500 => 'critical',
            $statusCode >= 400 => 'warning',
            default => 'info'
        };
    }

    private function resolveMessage(int $statusCode): string
    {
        return match (true) {
            $statusCode >= 500 => 'Server error',
            $statusCode >= 400 => 'Client error',
            default => 'Request successful'
        };
    }
}