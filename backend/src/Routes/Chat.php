<?php

use Backend\Controllers\Chat;

$controller = new Chat();

/*
    CHAT MESSAGE
    POST /api/chat/message
*/
if ($route === '/message' && $method === 'POST') {

    return $controller->message();
}

/*
    FALLBACK PARA CHAT
*/
http_response_code(405);

return [
    'success' => false,
    'message' => 'Método o ruta no permitida en Chat'
];