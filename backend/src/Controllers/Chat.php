<?php

declare(strict_types=1);

namespace Backend\Controllers;

use Backend\Models\Movie as MovieModel;
use Backend\Models\Showtime as ShowtimeModel;

class Chat
{
    private MovieModel $movieModel;
    private ShowtimeModel $showtimeModel;
    private const CONTEXT_KEY = 'cineman_chat_context';

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $this->movieModel = new MovieModel();
        $this->showtimeModel = new ShowtimeModel();
    }

    public function message(): array
    {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!$body || !isset($body['message'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Mensaje inválido'];
        }
        $rawMessage = trim((string) $body['message']);
        if ($rawMessage === '') {
            http_response_code(400);
            return ['success' => false, 'message' => 'Mensaje vacío'];
        }
        $catalog = $this->movieModel->get(true);
        if (empty($catalog)) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Lo siento, en este momento no hay películas activas en cartelera 😔'];
        }
        $normalized = $this->normalizeText($rawMessage);
        
        if ($this->looksLikeShowtimeSelection($normalized)) {
            return $this->buildSelectShowtimeResponse($rawMessage);
        }

        $genreResponse = $this->buildGenreRecommendationResponse($normalized, $rawMessage);
        if (!empty($genreResponse)) {
            return $genreResponse; 
        }

        if ($normalized === 'terror' || $normalized === 'comedia' || $normalized === 'accion' || $normalized === 'aventura') {
            return [
                'success' => true,
                'message' => "Por el momento no tengo películas de ese género disponibles en cartelera. 🍿 ¿Te gustaría ver qué otras opciones tenemos hoy? Escribe 'cartelera'."
            ];
        }
        
        $intent = $this->detectIntent($normalized);
        $response = match ($intent) {
            'greeting' => $this->buildGreetingResponse(),
            'goodbye' => $this->buildGoodbyeResponse(),
            'thanks' => $this->buildThanksResponse(),
            'help' => $this->buildHelpResponse(),
            'now_showing' => $this->buildNowShowingResponse($catalog),
            'prices' => $this->buildPricesResponse($catalog),
            'affirmative_movie' => $this->buildAffirmativeMovieResponse($catalog),
            'affirmative_showtime' => $this->buildAffirmativeShowtimeResponse($normalized),
            'emotion' => $this->buildEmotionRecommendationResponse($catalog, $normalized),
            'movie_query' => $this->buildMovieQueryResponse($catalog, $normalized),
            'showtime_query' => $this->buildShowtimeQueryResponse($catalog, $normalized),
            'advanced_search' => $this->buildAdvancedSearchResponse($catalog, $normalized),
            'dislike_horror' => $this->buildDislikeHorrorResponse($catalog),
            'genre_boredom' => $this->buildGenreBoredomResponse($catalog, $normalized),
            'genre_preference' => $this->buildGenrePreferenceResponse($catalog, $normalized),
            'buy_tickets' => $this->buildBuyTicketsResponse($catalog),
            default => $this->buildFallbackResponse($catalog)
        };
        return $response;
    }

    private function saveContext(
        ?array $movie = null,
        ?string $lastIntent = null
    ): void {
        $_SESSION[self::CONTEXT_KEY] = [
            'movie' => $movie,
            'last_intent' => $lastIntent,
            'updated_at' => time()
        ];
    }

    private function getContext(): ?array
    {
        if (!isset($_SESSION[self::CONTEXT_KEY])) {
            return null;
        }
        $context = $_SESSION[self::CONTEXT_KEY];
        if (!isset($context['updated_at']) || (time() - $context['updated_at']) > 1800) {
            unset($_SESSION[self::CONTEXT_KEY]);
            return null;
        }
        return $context;
    }

    private function getContextMovie(): ?array
    {
        $context = $this->getContext();
        return $context['movie'] ?? null;
    }

    private function getLastIntent(): ?string
    {
        $context = $this->getContext();
        return $context['last_intent'] ?? null;
    }

    private function getMovieShowtimes(string $movieId): array
    {
        return $this->showtimeModel->getByMovieId($movieId);
    }

    private function clearContext(): void
    {
        unset($_SESSION[self::CONTEXT_KEY]);
    }

    private function looksLikeShowtimeSelection(string $normalizedMessage): bool
    {
        if ($this->contains($normalizedMessage, 'funciones de')) {
            return false;
        }

        if (!preg_match_all('/[0-9]+/', $normalizedMessage, $matches)) {
            return false;
        }

        $hasTimeIndicator = $this->contains($normalizedMessage, ' a las ') || 
                             $this->contains($normalizedMessage, ' el ') || 
                             $this->contains($normalizedMessage, ' del ') ||
                             $this->contains($normalizedMessage, ' am') || 
                             $this->contains($normalizedMessage, ' pm') ||
                             preg_match('/\b\d{1,2}:\d{2}\b/', $normalizedMessage);

        return $hasTimeIndicator;
    }

    private function buildSelectShowtimeResponse(string $message): array
    {
        $day = null;
        $requestedHour = null;
        $requestedMinutes = null;

        if (preg_match('/\b(0?[1-9]|[12][0-9]|3[01])\b/', $message, $dayMatch)) {
            $day = (int) $dayMatch[1];
        }

        if (preg_match('/\b([0-1]?[0-9]|2[0-3])(?::|\s+)?([0-5][0-9])?\s*(am|pm)?\b/i', $message, $timeMatch)) {
            $requestedHour = (int) $timeMatch[1];
            $requestedMinutes = (isset($timeMatch[2]) && $timeMatch[2] !== '') ? (int) $timeMatch[2] : null;
            $period = strtolower($timeMatch[3] ?? '');

            if ($period === 'pm' && $requestedHour < 12) $requestedHour += 12;
            if ($period === 'am' && $requestedHour === 12) $requestedHour = 0;
        }

        if ($day === null || $requestedHour === null) {
            return ['success' => true, 'message' => 'Necesito que me indiques el día y la hora de la función 😅'];
        }

        $possibleHours = [$requestedHour];
        if (empty($period) && $requestedHour < 12) {
            $possibleHours[] = $requestedHour + 12;
        }

        $movieId = null;
        
        $currentMovie = $this->getContextMovie();
        if ($currentMovie && isset($currentMovie['id'])) {
            $movieId = (string)$currentMovie['id'];
        } 
        elseif (isset($_SESSION['chat_context']['movie']['id'])) {
            $movieId = (string)$_SESSION['chat_context']['movie']['id'];
        } elseif (isset($_SESSION['context']['id'])) {
            $movieId = (string)$_SESSION['context']['id'];
        } elseif (isset($_SESSION['movie_id'])) {
            $movieId = (string)$_SESSION['movie_id'];
        }

        $matchesFound = $this->showtimeModel->findByDayAndHours($day, $possibleHours, $requestedMinutes, $movieId);

        if (empty($matchesFound)) {
            if ($movieId !== null) {
                $matchesFound = $this->showtimeModel->findByDayAndHours($day, $possibleHours, $requestedMinutes, null);
            }
            if (empty($matchesFound)) {
                return ['success' => true, 'message' => 'No encontré ninguna función con esa fecha y horario disponible 😢'];
            }
        }

        if (count($matchesFound) > 1) {
            $optionsText = "Para ese horario encontré estas opciones disponibles:\n\n";
            $actions = [];
            foreach ($matchesFound as $match) {
                $optionsText .= "🎬 *{$match['title']}* ({$match['format']} - {$match['language']})\n";
                $actions[] = ['label' => "Ver " . $match['title'], 'value' => "funciones de " . $match['title']];
            }
            return [
                'success' => true,
                'type' => 'multiple_options',
                'message' => $optionsText . "\n¿Cuál te llama más la atención?",
                'data' => ['actions' => $actions]
            ];
        }

        $showtimeFound = $matchesFound[0];
        $movieSlug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $showtimeFound['title']), '-'));
        
        $appUrl = defined('APP_URL') ? APP_URL : '';
        $buyUrl = $appUrl . '/pelicula/' . $movieSlug . '?date=' . urlencode($showtimeFound['date']) . '&time=' . urlencode($showtimeFound['time']);
        $formattedDate = date('d/m/Y', strtotime($showtimeFound['date']));

        return [
            'success' => true,
            'message' => "🎟️ ¡Excelente elección!\n\n🍿 *{$showtimeFound['title']}*\n📅 {$formattedDate}\n🕒 {$showtimeFound['formatted_time']}\n\nTe dejo este enlace directo para completar tu compra y seleccionar tus asientos:\n{$buyUrl}"
        ];
    }

    private function buildAffirmativeShowtimeResponse(string $normalizedMessage): array
    {
        $preference = 'proxima';
        if ($this->contains($normalizedMessage, 'mañana') || $this->contains($normalizedMessage, 'temprano')) {
            $preference = 'mañana';
        } elseif ($this->contains($normalizedMessage, 'tarde')) {
            $preference = 'tarde';
        } elseif ($this->contains($normalizedMessage, 'noche')) {
            $preference = 'noche';
        }

        $bestShowtime = $this->showtimeModel->findNextByTimePreference($preference);

        if (!$bestShowtime) {
            $bestShowtime = $this->showtimeModel->findNextByTimePreference('proxima');
            $intro = "No encontré funciones exactamente para ese horario, pero aquí tienes una función próxima que te puede interesar:";
        } else {
            $intro = match ($preference) {
                'mañana' => "¡Claro! Para empezar el día con todo, te sugiero esta función:",
                'tarde' => "¡Perfecto! Para esta tarde te recomiendo:",
                'noche' => "¡Excelente plan nocturno! Aquí tienes una gran opción:",
                default => "¡Con gusto! Aquí tienes la función más próxima:"
            };
        }

        if ($bestShowtime) {
            $movie = [
                'id' => $bestShowtime['movie_id'], 
                'title' => $bestShowtime['title'], 
                'poster_url' => $bestShowtime['poster_url'] ?? ''
            ];
            
            return $this->composeShowtimeResponse($movie, $bestShowtime, $intro);
        }

        $catalog = $this->movieModel->get(true);
        return $this->buildFallbackResponse($catalog);
    }

    private function buildGreetingResponse(): array
    {
        $this->clearContext();

        return [
            'success' => true,
            'type' => 'greeting',
            'message' => "¡Hola! 👋 Soy Cineman, tu asistente virtual. Estoy aquí para ayudarte a elegir tu próxima película. ¿Te sugiero alguna?",
            'data' => [
                'actions' => [
                    ['label' => 'Sí, por favor', 'value' => 'sí'],
                    ['label' => 'Ver cartelera', 'value' => 'cartelera'],
                    ['label' => 'Buscar funciones', 'value' => 'funciones']
                ]
            ]
        ];
    }

    private function buildAffirmativeMovieResponse(array $catalog): array
    {
        $movie = $this->getRandomMovie($catalog);

        if (!$movie) {
            return $this->buildFallbackResponse($catalog);
        }

        $this->saveContext($movie, 'recommendation');

        return [
            'success' => true,
            'type' => 'recommendation',
            'message' =>
                "¡Excelente! 🍿 Te recomiendo \"{$movie['title']}\". " .
                "Es una muy buena opción en cartelera. " .
                "¿Quieres que te muestre los horarios disponibles?",
            'data' => [
                'movie' => $movie,
                'url' => "/movies/{$movie['id']}",
                'actions' => [
                    [
                        'label' => 'Ver funciones',
                        'value' => "funciones de {$movie['title']}"
                    ],
                    [
                        'label' => 'Otra recomendación',
                        'value' => 'recomienda otra'
                    ]
                ]
            ]
        ];
    }

    private function buildGoodbyeResponse(): array
    {
        $this->clearContext();

        return [
            'success' => true,
            'type' => 'goodbye',
            'message' => '¡Nos vemos! Si necesitas algo más, aquí estaré. ¡Que disfrutes la función y no olvides tus palomitas! 🍿🎬',
            'data' => [
                'actions' => [
                    ['label' => 'Ver cartelera', 'value' => 'cartelera']
                ]
            ]
        ];
    }

    private function buildThanksResponse(): array
    {
        return [
            'success' => true,
            'type' => 'thanks',
            'message' => '¡Para eso estoy! Fue un placer ayudarte. 😊 ¿Te puedo apoyar con alguna otra película o revisamos los horarios?',
            'data' => [
                'actions' => [
                    ['label' => 'Dame otra recomendación', 'value' => 'recomienda algo'],
                    ['label' => 'Ver todas las funciones', 'value' => 'funciones']
                ]
            ]
        ];
    }

    private function buildHelpResponse(): array
    {
        return [
            'success' => true,
            'type' => 'help',
            'message' => "¡Claro! Puedo ayudarte a planear tu visita al cine. 🍿\n\nPrueba escribiendo cosas como:\n• \"¿Qué películas hay hoy?\"\n• \"Me siento triste, recomiéndame algo\"\n• \"Quiero ver una de acción\"\n• \"¿Cuánto cuestan los boletos?\"\n\n¿Con qué empezamos?",
            'data' => [
                'actions' => [
                    ['label' => 'Ver cartelera', 'value' => 'cartelera'],
                    ['label' => 'Consultar precios', 'value' => 'precio'],
                    ['label' => 'Ver funciones de hoy', 'value' => 'funciones']
                ]
            ]
        ];
    }

    private function buildNowShowingResponse(array $catalog): array
    {
        $movie = $this->getRandomMovie($catalog);

        if (!$movie) {
            return $this->buildFallbackResponse($catalog);
        }

        $this->saveContext($movie, 'recommendation');

        $messages = [
            "🍿 Tenemos varias películas muy buenas en cartelera.",
            "🎬 Hay opciones bastante interesantes hoy.",
            "🔥 Estas son algunas de las películas que más están llamando la atención.",
            "🚀 La cartelera de hoy viene fuerte.",
            "😎 Hay muy buenas opciones para ver hoy."
        ];

        $intro = $messages[array_rand($messages)];

        return [
            'success' => true,
            'type' => 'recommendation',
            'message' =>
                "{$intro}\n\n" .
                "Te recomiendo empezar con \"{$movie['title']}\". " .
                "¿Quieres ver los horarios disponibles?",
            'data' => [
                'movie' => $movie,
                'url' => "/movies/{$movie['id']}",
                'actions' => [
                    [
                        'label' => 'Ver funciones',
                        'value' => "funciones de {$movie['title']}"
                    ],
                    [
                        'label' => 'Otra recomendación',
                        'value' => 'recomienda otra'
                    ],
                    [
                        'label' => 'Ver cartelera completa',
                        'value' => 'cartelera'
                    ]
                ]
            ]
        ];
    }

    private function buildPricesResponse(array $catalog): array
    {
        $movieData = $this->findFeaturedMovieWithShowtime($catalog);

        if (!$movieData) {
            return [
                'success' => true,
                'type' => 'prices',
                'message' => 'Los precios varían un poco dependiendo de la película y el formato (2D, 3D, VIP). Dime qué película quieres ver y te doy el costo exacto. 🎟️',
                'data' => [
                    'actions' => [
                        ['label' => 'Ver cartelera', 'value' => 'cartelera']
                    ]
                ]
            ];
        }

        $movie = $movieData['movie'];
        $showtime = $movieData['showtime'];

        return [
            'success' => true,
            'type' => 'prices',
            'message' => "El boleto para la función de \"{$movie['title']}\" está en \$" . number_format((float) $showtime['price'], 2) . " MXN.\n\n¡Anímate, aún alcanzas buenos lugares!",
            'data' => [
                'movie' => $movie,
                'showtime' => $showtime,
                'url' => "/movies/{$movie['id']}",
                'actions' => [
                    ['label' => 'Ver más funciones', 'value' => 'funciones']
                ]
            ]
        ];
    }

    private function buildEmotionRecommendationResponse(
        array $catalog,
        string $normalizedMessage
    ): array {
        $emotionMap = [
            'triste' => [
                'genre' => 'comedia',
                'intro' =>
                    'Siento mucho que estés así 🥺. ' .
                    'A veces el cine es la mejor medicina.'
            ],

            'animo' => [
                'genre' => 'comedia',
                'intro' =>
                    '¡Arriba ese ánimo! 💪 ' .
                    'Una buena historia puede cambiarte el día.'
            ],

            'feliz' => [
                'genre' => 'aventura',
                'intro' =>
                    '¡Qué buena vibra! ✨ ' .
                    'Hay que mantener esa energía arriba.'
            ],

            'aburrido' => [
                'genre' => 'accion',
                'intro' =>
                    '🚀 Vamos a quitarte ese aburrimiento.'
            ],

            'solo' => [
                'genre' => 'drama',
                'intro' =>
                    '🛋️ El cine siempre es buena compañía.'
            ],

            'enamorado' => [
                'genre' => 'romance',
                'intro' =>
                    '❤️ Ese mood merece una buena historia romántica.'
            ],

            'amor' => [
                'genre' => 'romance',
                'intro' =>
                    '❤️ Ese mood merece una buena historia romántica.'
            ],

            'miedo' => [
                'genre' => 'terror',
                'intro' =>
                    '👻 Entonces hay que subir la adrenalina.'
            ],

            'asustado' => [
                'genre' => 'terror',
                'intro' =>
                    '👻 Entonces hay que subir la adrenalina.'
            ],

            'estresado' => [
                'genre' => 'comedia',
                'intro' =>
                    '🧘‍♂️ Necesitas relajarte un rato.'
            ],

            'deprimido' => [
                'genre' => 'comedia',
                'intro' =>
                    '🥺 Una buena película puede ayudarte a despejarte.'
            ],

            'felicidad' => [
                'genre' => 'aventura',
                'intro' =>
                    '✨ Hay que aprovechar esa buena vibra.'
            ]
        ];

        foreach ($emotionMap as $keyword => $config) {

            if ($this->contains($normalizedMessage, $keyword)) {

                $movie = $this->getRandomMovieByGenre(
                    $catalog,
                    $config['genre']
                );

                if (!$movie) {
                    break;
                }

                $this->saveContext($movie, 'recommendation');

                return [
                    'success' => true,
                    'type' => 'recommendation',
                    'message' =>
                        "{$config['intro']} " .
                        "Te recomiendo \"{$movie['title']}\". " .
                        "¿Quieres ver los horarios disponibles?",
                    'data' => [
                        'movie' => $movie,
                        'url' => "/movies/{$movie['id']}",
                        'reason' => $keyword,
                        'actions' => [
                            [
                                'label' => 'Ver funciones',
                                'value' => "funciones de {$movie['title']}"
                            ],
                            [
                                'label' => 'Otra recomendación',
                                'value' => 'recomienda otra'
                            ]
                        ]
                    ]
                ];
            }
        }

        return $this->buildFallbackResponse($catalog);
    }

    private function buildGenreRecommendationResponse(string $normalizedMessage, string $rawMessage): array
    {
        $genreMap = [
            'accion' => 'accion', 'acción' => 'accion', 'aventura' => 'aventura', 'animada' => 'animada',
            'animacion' => 'animada', 'comedia' => 'comedia', 'risa' => 'comedia', 'divertida' => 'comedia',
            'crimen' => 'crimen', 'drama' => 'drama', 'fantasia' => 'fantasia', 'fantasía' => 'fantasia',
            'horror' => 'horror', 'miedo' => 'terror', 'terror' => 'terror', 'romance' => 'romance',
            'romantica' => 'romance', 'romántica' => 'romance', 'sci fi' => 'sci_fi', 'scifi' => 'sci_fi',
            'ciencia ficcion' => 'sci_fi', 'ciencia ficción' => 'sci_fi', 'misterio' => 'misterio',
            'videojuego' => 'videojuego', 'noir' => 'noir', 'thriller' => 'thriller'
        ];

        foreach ($genreMap as $keyword => $genre) {
            if ($this->contains($normalizedMessage, $keyword) || $this->contains($this->normalizeText($rawMessage), $keyword)) {
                $movie = $this->movieModel->getRandomByGenre($genre);
                if (!$movie) continue;

                $this->saveContext($movie, 'recommendation');
                return [
                    'success' => true,
                    'type' => 'recommendation',
                    'message' => "¡Excelente elección! 🍿 Si buscas algo de {$keyword}, te recomiendo \"{$movie['title']}\". ¿Quieres ver los horarios disponibles?",
                    'data' => [
                        'movie' => $movie,
                        'url' => "/movies/{$movie['id']}",
                        'genre' => $genre,
                        'actions' => [
                            ['label' => 'Ver funciones', 'value' => "funciones de {$movie['title']}"],
                            ['label' => 'Otra recomendación', 'value' => 'recomienda otra']
                        ]
                    ]
                ];
            }
        }
        return [];
    }
    private function buildMovieQueryResponse(array $catalog, string $normalizedMessage): array
    {
        $movie = $this->findBestMovieMatch($catalog, $normalizedMessage);

        if (!$movie) {
            return $this->buildFallbackResponse($catalog);
        }

        $showtime = $this->showtimeModel->getNextByMovieId($movie['id']);

        if ($showtime) {
            return $this->composeShowtimeResponse(
                $movie,
                $showtime,
                "¡Esa película es buenísima! 🚀 Encontré la mejor función disponible para \"{$movie['title']}\""
            );
        }

        return [
            'success' => true,
            'type' => 'movie',
            'message' => "Encontré \"{$movie['title']}\" en el sistema, pero lamentablemente ya no tiene funciones disponibles por hoy 😔.",
            'data' => [
                'movie' => $movie,
                'url' => "/movies/{$movie['id']}",
                'actions' => [
                    ['label' => 'Ver cartelera', 'value' => 'cartelera']
                ]
            ]
        ];
    }

    private function buildShowtimeQueryResponse(array $catalog, string $normalizedMessage): array
    {
        $movie = $this->findBestMovieMatch($catalog, $normalizedMessage);

        if (!$movie) {
            $movie = $this->getContextMovie();
        }

        if (!$movie) {
            return [
                'success' => true,
                'type' => 'showtime',
                'message' => '🎬 Dime qué película quieres ver y te muestro sus funciones.',
                'data' => [
                    'actions' => [
                        ['label' => 'Ver cartelera', 'value' => 'cartelera']
                    ]
                ]
            ];
        }

        $this->saveContext($movie, 'showtime_query');
        $showtimes = $this->getMovieShowtimes($movie['id']);

        if (empty($showtimes)) {
            return [
                'success' => true,
                'type' => 'showtime',
                'message' => "😔 \"{$movie['title']}\" no tiene funciones disponibles por ahora.",
                'data' => [
                    'movie' => $movie,
                    'url' => "/movies/{$movie['id']}",
                    'actions' => [
                        ['label' => 'Otra recomendación', 'value' => 'recomiéndame otra']
                    ]
                ]
            ];
        }

        $grouped = [];
        foreach ($showtimes as $showtime) {
            $date = new \DateTime($showtime['start_time']);
            $day = $date->format('d/m/Y');
            $grouped[$day][] = [
                'time' => $showtime['formatted_time'] ?? $date->format('h:i A'),
                'room' => $showtime['room'],
                'format' => $showtime['format'],
                'language' => $showtime['language'],
                'price' => number_format((float) $showtime['price'], 2)
            ];
        }

        $sections = [];
        foreach ($grouped as $date => $items) {
            $functions = [];
            foreach ($items as $item) {
                $functions[] = "🎬 {$item['time']} · Sala {$item['room']} ({$item['format']}, {$item['language']}) · \${$item['price']} MXN";
            }
            $sections[] = "📅 {$date}\n\n" . implode("\n", $functions);
        }

        return [
            'success' => true,
            'type' => 'showtimes',
            'message' => "🍿 Estas son las funciones disponibles para \"{$movie['title']}\":\n\n" . implode("\n\n", $sections),
            'data' => [
                'movie' => $movie,
                'showtimes' => $showtimes,
                'url' => "/movies/{$movie['id']}",
                'actions' => [
                    ['label' => 'Comprar boletos', 'value' => 'comprar boletos'],
                    ['label' => 'Otra película', 'value' => 'recomiéndame otra']
                ]
            ]
        ];
    }

    private function buildFallbackResponse(array $catalog): array
    {
        $movie = $this->getRandomMovie($catalog);

        if (!$movie) {
            return [
                'success' => true,
                'type' => 'fallback',
                'message' => 'Por ahora no tengo películas disponibles en cartelera 😔',
                'data' => []
            ];
        }

        $this->saveContext($movie, 'recommendation');

        $messages = [
            "Entonces yo elijo por ti 😎",
            "Tengo una opción que casi siempre gusta 🍿",
            "Si no sabes qué ver, empieza por esta",
            "Déjamelo a mí 🎬",
            "Perfecto, esta está destacando bastante hoy"
        ];

        $intro = $messages[array_rand($messages)];

        return [
            'success' => true,
            'type' => 'recommendation',
            'message' =>
                "{$intro}. Te recomiendo \"{$movie['title']}\". " .
                "¿Quieres que te muestre los horarios disponibles?",
            'data' => [
                'movie' => $movie,
                'url' => "/movies/{$movie['id']}",
                'actions' => [
                    [
                        'label' => 'Ver funciones',
                        'value' => "funciones de {$movie['title']}"
                    ],
                    [
                        'label' => 'Otra recomendación',
                        'value' => 'recomienda otra'
                    ]
                ]
            ]
        ];
    }

    private function buildAdvancedSearchResponse(array $catalog, string $normalizedMessage): array
    {
        $filters = $this->extractFilters($normalizedMessage);

        $showtime = $this->queryDatabaseBuilder($filters);

        if (!$showtime) {
            $relaxed = $filters;
            $relaxed['format'] = null;
            $relaxed['language'] = null;

            $showtime = $this->queryDatabaseBuilder($relaxed);
        }

        if (!$showtime) {
            $relaxed['datetime'] = date('Y-m-d H:i:s');
            $relaxed['time_condition'] = '>=';

            $showtime = $this->queryDatabaseBuilder($relaxed);
        }

        if (!$showtime) {
            return $this->buildFallbackResponse($catalog);
        }

        $movie = [
            'id' => $showtime['movie_id'],
            'title' => $showtime['title'],
            'genres' => $showtime['genres'] ?? '',
            'classification' => $showtime['classification'] ?? '',
            'synopsis' => $showtime['synopsis'] ?? '',
            'poster_url' => $showtime['poster_url'] ?? ''
        ];

        return $this->composeShowtimeResponse(
            $movie,
            $showtime,
            '🎯 Encontré una función perfecta según tus preferencias'
        );
    }

    private function buildDislikeHorrorResponse(array $catalog): array
    {
        $safeGenres = [
            'comedia',
            'aventura',
            'animada',
            'romance',
            'fantasia'
        ];

        shuffle($safeGenres);

        foreach ($safeGenres as $genre) {
            $movie = $this->getRandomMovieByGenre($catalog, $genre);

            if ($movie) {
                $showtime = $this->showtimeModel->getNextByMovieId($movie['id']);

                if ($showtime) {
                    return $this->composeShowtimeResponse(
                        $movie,
                        $showtime,
                        '😌 Perfecto, nada de sustos hoy. Te recomiendo algo más relajado y disfrutable'
                    );
                }
            }
        }

        return $this->buildFallbackResponse($catalog);
    }

    private function buildGenreBoredomResponse(array $catalog, string $normalizedMessage): array
    {
        $avoidGenre = null;
        $genreMap = [
            'accion' => 'accion', 'acción' => 'accion', 'comedia' => 'comedia',
            'terror' => 'terror', 'horror' => 'terror', 'miedo' => 'terror',
            'romance' => 'romance', 'romantica' => 'romance', 'drama' => 'drama',
            'aventura' => 'aventura', 'animada' => 'animada', 'animacion' => 'animada',
            'fantasia' => 'fantasia', 'thriller' => 'thriller', 'suspenso' => 'thriller'
        ];

        foreach ($genreMap as $keyword => $genre) {
            if ($this->contains($normalizedMessage, $keyword)) {
                $avoidGenre = $genre;
                break;
            }
        }

        // Buscamos una película que NO tenga el género que aburre al usuario
        foreach ($catalog as $movie) {
            $movieGenres = explode(',', strtolower($movie['genres'] ?? ''));
            
            if ($avoidGenre && in_array($avoidGenre, $movieGenres, true)) {
                continue; // Saltamos las películas del género aburrido
            }

            $this->saveContext($movie, 'recommendation');

            return [
                'success' => true,
                'type' => 'recommendation',
                'message' => "¡Entendido! Cambiemos de aires y cero flojera. 🚀 ¿Qué te parece si vemos \"{$movie['title']}\"? Avísame si quieres revisar sus horarios.",
                'data' => [
                    'movie' => $movie,
                    'url' => "/movies/{$movie['id']}",
                    'actions' => [
                        ['label' => 'Ver funciones', 'value' => "funciones de {$movie['title']}"],
                        ['label' => 'Dime otra opción', 'value' => 'recomienda otra']
                    ]
                ]
            ];
        }

        return $this->buildFallbackResponse($catalog);
    }

    private function buildGenrePreferenceResponse(array $catalog, string $normalizedMessage): array
    {
        return $this->buildGenreRecommendationResponse(
            $catalog,
            $normalizedMessage,
            $normalizedMessage
        );
    }

    private function composeShowtimeResponse(
        array $movie,
        array $showtime,
        string $intro
    ): array {

        $this->saveContext($movie, 'showtime');

        $date = new \DateTime($showtime['start_time']);

        $formattedDate = $date->format('d/m/Y');

        $formattedTime =
            $showtime['formatted_time']
            ?? $date->format('h:i A');

        $seats =
            (int) ($showtime['available_seats'] ?? 0);

        $urgency =
            $seats <= 10
            ? ' ⚠️ Quedan pocos lugares disponibles.'
            : '';

        return [
            'success' => true,
            'type' => 'showtime',
            'message' =>
                "{$intro}.\n\n" .
                "🎬 \"{$movie['title']}\"\n" .
                "📅 {$formattedDate}\n" .
                "🕒 {$formattedTime}\n" .
                "📍 Sala {$showtime['room']} ({$showtime['format']}, {$showtime['language']})\n" .
                "💰 \$" .
                number_format((float) $showtime['price'], 2) .
                " MXN{$urgency}",
            'data' => [
                'movie' => $movie,
                'showtime' => $showtime,
                'url' => "/movies/{$movie['id']}",
                'actions' => [
                    [
                        'label' => 'Comprar boletos',
                        'value' => 'comprar'
                    ],
                    [
                        'label' => 'Ver más horarios',
                        'value' => "funciones de {$movie['title']}"
                    ],
                    [
                        'label' => 'Otra película',
                        'value' => 'recomienda otra'
                    ]
                ]
            ]
        ];
    }

    private function findFeaturedMovieWithShowtime(array $catalog): ?array
    {
        foreach ($catalog as $movie) {
            $showtime = $this->showtimeModel->getNextByMovieId((string) $movie['id']);

            if ($showtime) {
                return [
                    'movie' => $movie,
                    'showtime' => $showtime
                ];
            }
        }

        return null;
    }

    private function getRandomMovie(array $catalog): ?array
    {
        if (empty($catalog)) {
            return null;
        }

        return $catalog[array_rand($catalog)];
    }

    private function getRandomMovieByGenre(array $catalog, string $genre): ?array
    {
        $matches = [];

        foreach ($catalog as $movie) {
            $genres = $this->normalizeText((string) ($movie['genres'] ?? ''));

            if ($this->contains($genres, $genre)) {
                $matches[] = $movie;
            }
        }

        if (empty($matches)) {
            return $this->getRandomMovie($catalog);
        }

        return $matches[array_rand($matches)];
    }

    private function findBestMovieMatch(array $catalog, string $normalizedMessage): ?array
    {
        $bestMovie = null;
        $bestScore = 0;

        $quotedTitle = $this->extractQuotedText($normalizedMessage);

        foreach ($catalog as $movie) {
            $title = $this->normalizeText((string) ($movie['title'] ?? ''));
            $score = 0;

            if ($quotedTitle !== null) {
                similar_text($quotedTitle, $title, $percent);
                $score += (int) round($percent * 2);
            }

            if ($title !== '' && $this->contains($normalizedMessage, $title)) {
                $score += 60;
            }

            if ($title !== '' && $this->contains($title, $normalizedMessage)) {
                $score += 45;
            }

            $score += $this->wordOverlapScore($normalizedMessage, $title);

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMovie = $movie;
            }
        }

        return $bestScore >= 25 ? $bestMovie : null;
    }

    private function wordOverlapScore(string $message, string $title): int
    {
        $messageWords = $this->tokenize($message);
        $titleWords = $this->tokenize($title);

        if (empty($messageWords) || empty($titleWords)) {
            return 0;
        }

        $stopWords = [
            'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'y', 'o', 'me',
            'quiero', 'ver', 'quiero', 'busco', 'buscar', 'dame', 'recomienda',
            'recomiendame', 'recomiéndame', 'algo', 'que', 'para', 'con', 'por',
            'favor', 'hoy', 'ahora', 'funcion', 'funciones', 'pelicula', 'pelicula',
            'pelicula', 'cine', 'ver', 'ir', 'a', 'en', 'mi', 'tu'
        ];

        $messageWords = array_values(array_diff($messageWords, $stopWords));
        $titleWords = array_values(array_diff($titleWords, $stopWords));

        if (empty($messageWords) || empty($titleWords)) {
            return 0;
        }

        $matches = count(array_intersect($messageWords, $titleWords));

        return $matches * 15;
    }

    private function tokenize(string $text): array
    {
        $text = preg_replace('/[^a-z0-9\s]+/i', ' ', $text);
        $parts = preg_split('/\s+/', trim((string) $text)) ?: [];

        return array_values(array_filter($parts, fn ($word) => $word !== ''));
    }

    private function extractFilters(string $message): array
    {
        $filters = ['format' => null, 'language' => null, 'genre' => null, 'classification' => null, 'datetime' => null, 'time_condition' => '>='];
        $tokens = $this->tokenize($message);
        if (in_array('3d', $tokens)) $filters['format'] = '3D';
        elseif (in_array('imax', $tokens)) $filters['format'] = 'IMAX';
        elseif (in_array('2d', $tokens)) $filters['format'] = '2D';
        if (count(array_intersect($tokens, ['sub', 'subs', 'subtitulada', 'subtituladas', 'ingles', 'inglés'])) > 0) $filters['language'] = 'SUB';
        elseif (count(array_intersect($tokens, ['esp', 'español', 'espanol', 'doblada', 'latino'])) > 0) $filters['language'] = 'ESP';
        if (in_array('b15', $tokens) || in_array('b-15', $tokens)) $filters['classification'] = 'B15';
        elseif (in_array('aa', $tokens)) $filters['classification'] = 'AA';
        elseif (in_array('a', $tokens)) $filters['classification'] = 'A';
        elseif (in_array('b', $tokens)) $filters['classification'] = 'B';
        elseif (in_array('c', $tokens)) $filters['classification'] = 'C';
        elseif (in_array('d', $tokens)) $filters['classification'] = 'D';
        $genreMap = ['accion' => 'accion', 'acción' => 'accion', 'aventura' => 'aventura', 'animada' => 'animada', 'animacion' => 'animada', 'animación' => 'animada', 'comedia' => 'comedia', 'crimen' => 'crimen', 'drama' => 'drama', 'fantasia' => 'fantasia', 'fantasía' => 'fantasia', 'horror' => 'horror', 'romance' => 'romance', 'sci_fi' => 'sci_fi', 'scifi' => 'sci_fi', 'sci fi' => 'sci_fi', 'ciencia ficcion' => 'sci_fi', 'ciencia ficción' => 'sci_fi', 'thriller' => 'thriller', 'misterio' => 'misterio', 'videojuego' => 'videojuego', 'terror' => 'terror', 'noir' => 'noir', 'suspenso' => 'thriller'];
        foreach ($genreMap as $key => $dbValue) {
            if (strpos($message, $key) !== false) {
                $filters['genre'] = $dbValue;
                break;
            }
        }
        $hour = null;
        if (preg_match('/(?:despues|después|luego|pasadas)\s+(?:de\s+las|de\s+la|las|la)?\s*(\d+)/i', $message, $matches)) {
            $hour = intval($matches[1]);
            $filters['time_condition'] = '>=';
        } elseif (preg_match('/(?:antes|temprano)\s+(?:de\s+las|de\s+la|las|la)?\s*(\d+)/i', $message, $matches)) {
            $hour = intval($matches[1]);
            $filters['time_condition'] = '<=';
        } elseif (preg_match('/(?:a\s+las|las)\s*(\d+)/i', $message, $matches)) {
            $hour = intval($matches[1]);
            $filters['time_condition'] = '>=';
        }
        if (!in_array($filters['time_condition'], ['>=', '<='], true)) {
            $filters['time_condition'] = '>=';
        }
        if ($hour !== null) {
            if ($hour < 12 && (strpos($message, 'tarde') !== false || strpos($message, 'noche') !== false || $hour >= 1 && $hour <= 9)) {
                $hour += 12; 
            }
            $filters['datetime'] = date('Y-m-d') . sprintf(' %02d:00:00', $hour);
        } else {
            $filters['datetime'] = date('Y-m-d H:i:s');
        }
        return $filters;
    }

    public function executeAdvancedQuery(array $filters)
    {
        $showtime = $this->queryDatabaseBuilder($filters);
        if ($showtime) return $this->respond("¡Justo lo que querías! Aquí tienes:", $showtime);

        $relaxed = $filters;
        $relaxed['format'] = null;
        $relaxed['language'] = null;
        $showtime = $this->queryDatabaseBuilder($relaxed);
        if ($showtime) return $this->respond("No tengo una función exacta en ese formato o idioma, pero encontré la más cercana:", $showtime);

        $relaxed['datetime'] = date('Y-m-d H:i:s');
        $relaxed['time_condition'] = '>=';
        $showtime = $this->queryDatabaseBuilder($relaxed);
        if ($showtime) return $this->respond("No encontré funciones a esa hora específica, pero tengo esta opción del mismo género para hoy:", $showtime);

        $fallback = ['format' => null, 'language' => null, 'genre' => null, 'classification' => null, 'datetime' => date('Y-m-d H:i:s'), 'time_condition' => '>='];
        $showtime = $this->queryDatabaseBuilder($fallback);
        
        return $this->respond("No encontré coincidencia exacta con tus filtros, pero te recomiendo la función más próxima en cartelera:", $showtime);
    }

    private function queryDatabaseBuilder(array $filters)
    {
        $sql = "SELECT s.*, m.title, m.genres, m.classification, m.synopsis, m.poster_url 
                FROM showtimes s 
                JOIN movies m ON s.movie_id = m.id 
                WHERE s.is_active = 1 AND m.is_active = 1";
        $params = [];

        if ($filters['format']) { $sql .= " AND s.format = ?"; $params[] = $filters['format']; }
        if ($filters['language']) { $sql .= " AND s.language = ?"; $params[] = $filters['language']; }
        if ($filters['classification']) { $sql .= " AND m.classification = ?"; $params[] = $filters['classification']; }
        if ($filters['genre']) { 
            $sql .= " AND FIND_IN_SET(?, m.genres) > 0"; 
            $params[] = $filters['genre']; 
        }
        
        if ($filters['datetime']) {
            // SANEAMIENTO FINAL: Si por alguna razón llegó algo raro, se fuerza un operador seguro
            $operator = in_array($filters['time_condition'], ['>=', '<='], true) ? $filters['time_condition'] : '>=';
            $sql .= " AND s.start_time " . $operator . " ?";
            $params[] = $filters['datetime'];
        }

        $sql .= " ORDER BY ABS(TIMEDIFF(s.start_time, ?)) ASC LIMIT 1";
        $params[] = $filters['datetime'] ?? date('Y-m-d H:i:s');

        return $this->db->query($sql, $params)->first(); 
    }

    public function searchShowtime($userMessage)
    {
        $filters = $this->extractFilters($userMessage);
        $showtime = $this->queryDatabase($filters, true); 

        if ($showtime) {
            return $this->formatResponse("¡Excelente elección! Encontré justo lo que buscabas:", $showtime);
        }

        $relaxedFilters = $filters;
        $relaxedFilters['format'] = null;
        $relaxedFilters['language'] = null;
        $showtime = $this->queryDatabase($relaxedFilters, false);

        if ($showtime) {
            return $this->formatResponse("No tengo una función exacta en el formato o idioma que me pides, pero esta es la más cercana que te va a encantar:", $showtime);
        }

        $relaxedFilters['time'] = null; 
        $showtime = $this->queryDatabase($relaxedFilters, false);

        if ($showtime) {
            return $this->formatResponse("No encontré funciones a esa hora, pero tengo esta otra opción de " . $filters['genre'] . " para ti:", $showtime);
        }

        $fallbackFilters = ['format' => null, 'language' => null, 'genre' => null, 'time' => date('H:i:s'), 'time_condition' => '>='];
        $showtime = $this->queryDatabase($fallbackFilters, false);

        return $this->formatResponse("No encontré nada similar a tu búsqueda, pero ¿qué te parece si vemos la función más próxima en cartelera?:", $showtime);
    }

    private function queryDatabase($filters, $strictTime)
    {
        $sql = "SELECT s.*, m.title, m.genre, m.classification 
                FROM showtimes s 
                JOIN movies m ON s.movie_id = m.id 
                WHERE 1=1";
        
        $params = [];

        if ($filters['format']) { $sql .= " AND s.format = ?"; $params[] = $filters['format']; }
        if ($filters['language']) { $sql .= " AND s.language = ?"; $params[] = $filters['language']; }
        if ($filters['genre']) { $sql .= " AND m.genre = ?"; $params[] = $filters['genre']; }
        if ($filters['classification']) { $sql .= " AND m.classification = ?"; $params[] = $filters['classification']; }
        
        if ($filters['time']) {
            $sql .= " AND s.time " . $filters['time_condition'] . " ?";
            $params[] = $filters['time'];
        }

        $sql .= " ORDER BY ABS(TIMEDIFF(s.time, NOW())) ASC LIMIT 1";

        return $this->db->execute($sql, $params)->fetch();
    }

    private function detectIntent(string $normalizedMessage): string
    {
        $tokens = $this->tokenize($normalizedMessage);
        $contextMovie = $this->getContextMovie();
        $purchaseKeywords = ['comprar', 'comprar boletos', 'comprar entradas', 'boletos', 'entradas', 'reservar', 'reservacion', 'reservación', 'pagar'];

        foreach ($purchaseKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'purchase';
            }
        }

        $affirmativeTokens = ['si', 'sí', 'claro', 'dale', 'ok', 'va', 'simon', 'simón', 'obvio', 'yes', 'sipi', 'sip', 'excelente', 'perfecto'];
        $isAffirmative = count(array_intersect($tokens, $affirmativeTokens)) > 0;
        $showtimeFollowupKeywords = ['funcion', 'funciones', 'horario', 'horarios', 'a que hora', 'a qué hora', 'cuando', 'cuándo', 'que funciones hay', 'qué funciones hay', 'ver funciones'];
        $hasShowtimeIntent = false;

        foreach ($showtimeFollowupKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                $hasShowtimeIntent = true;
                break;
            }
        }

        $lastIntent = $this->getLastIntent();
        if ($contextMovie) {
            if ($lastIntent === 'recommendation' && $isAffirmative && count($tokens) <= 4) {
                return 'affirmative_showtime';
            }
            if ($hasShowtimeIntent) {
                return 'showtime_query';
            }
        }

        $exactTokensAdvanced = ['3d', '2d', 'imax', 'sub', 'subs', 'esp', 'aa', 'a', 'b', 'b15', 'b-15', 'c', 'd'];
        if (count(array_intersect($tokens, $exactTokensAdvanced)) > 0) {
            return 'advanced_search';
        }

        $advancedKeywords = ['subtitulada', 'subtituladas', 'idioma original', 'ingles', 'inglés', 'español', 'espanol', 'doblada', 'latino', 'castellano', 'clasificacion', 'clasificación', 'para niños', 'para adultos'];
        foreach ($advancedKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'advanced_search';
            }
        }

        $dislikeHorrorKeywords = ['me da miedo', 'me dan miedo', 'me asusta', 'no de terror', 'no quiero terror', 'sin terror', 'nada de terror', 'no me gusta el terror', 'odio el terror', 'me da pavor', 'da miedo', 'evita el terror', 'cero terror', 'no me asustes'];
        foreach ($dislikeHorrorKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'dislike_horror';
            }
        }

        $genreBoredomKeywords = ['me aburren', 'me aburre', 'que aburrido', 'qué aburrido', 'me da hueva', 'que hueva', 'me da pereza', 'que pereza', 'no me llama', 'no me interesan', 'no me interesa', 'esas no', 'esos no', 'que flojera', 'me da flojera', 'aburridisimo', 'aburridísimo', 'no se me antoja'];
        foreach ($genreBoredomKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'genre_boredom';
            }
        }

        $genrePreferenceKeywords = ['soy mas de', 'soy más de', 'me va mas', 'me va más', 'me gusta mas', 'me gusta más', 'prefiero las de', 'prefiero los de', 'me inclino por', 'voy mas por', 'voy más por', 'busco algo de', 'soy fan de las de', 'soy fan de los de'];
        foreach ($genrePreferenceKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'genre_preference';
            }
        }

        $recommendationKeywords = ['otra', 'recomiendame', 'recomiéndame', 'sugiereme', 'sugiéreme', 'siguiente', 'dame otra', 'opcion diferente', 'algo mas', 'algo más', 'no me gusta', 'otra pelicula', 'otra película', 'alguna sugerencia', 'que me recomiendas', 'qué me recomiendas', 'pasame otra', 'pásame otra', 'tienes otra', 'no me convence', 'recomienda algo'];
        foreach ($recommendationKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'affirmative_movie';
            }
        }

        $showtimeKeywords = ['quiero ver', 'ver ', 'busca ', 'buscar ', 'quiero ', 'funcion', 'funciones', 'horario', 'cuando', 'cuándo', 'a que hora', 'a qué hora', 'horarios', 'donde veo', 'dónde veo', 'ver funciones'];
        foreach ($showtimeKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'showtime_query';
            }
        }

        $nowShowingKeywords = ['cartelera', 'en cartelera', 'peliculas', 'películas', 'que hay', 'qué hay', 'estrenos', 'en el cine', 'que estan dando', 'qué están dando', 'funciones de hoy', 'cartelera de hoy'];
        foreach ($nowShowingKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'now_showing';
            }
        }

        $priceKeywords = ['precio', 'costo', 'cuanto cuesta', 'cuánto cuesta', 'tarifa', 'precios', 'costos', 'cuanto salen', 'cuánto salen', 'cuanto valen', 'cuánto valen', 'promo', 'promocion', 'promociones', 'descuento'];
        foreach ($priceKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'prices';
            }
        }

        $genreKeywords = ['accion', 'acción', 'aventura', 'animada', 'animacion', 'animación', 'comedia', 'crimen', 'drama', 'fantasia', 'fantasía', 'horror', 'romance', 'sci_fi', 'scifi', 'sci fi', 'ciencia ficcion', 'ciencia ficción', 'thriller', 'misterio', 'videojuego', 'terror', 'noir', 'suspenso'];
        foreach ($genreKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'genres';
            }
        }

        $emotionKeywords = ['triste', 'feliz', 'aburrido', 'solo', 'enamorado', 'amor', 'miedo', 'asustado', 'estresado', 'deprimido', 'animo', 'ánimo', 'enojado', 'melancolico', 'melancólico', 'llorar', 'reir', 'reír', 'bajon', 'bajón', 'contento', 'alegre'];
        foreach ($emotionKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'emotion';
            }
        }

        $timeTokens = ['proxima', 'próxima', 'tarde', 'mañana', 'noche', 'temprano', 'siguiente', 'despues', 'después', 'hoy'];
        $hasTimePreference = count(array_intersect($tokens, $timeTokens)) > 0;
        if ($isAffirmative && $hasTimePreference) {
            return 'affirmative_showtime';
        }
        if ($isAffirmative && count($tokens) <= 4) {
            return 'affirmative_movie';
        }

        $greetingKeywords = ['ola', 'hola', 'buenas', 'buen día', 'buen dia', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'que tal', 'qué tal', 'q tal', 'holi', 'saludos', 'quien eres', 'quién eres', 'como te llamas', 'cómo te llamas', 'que eres', 'tu nombre', 'presentate', 'preséntate', 'eres humano', 'eres un bot'];
        foreach ($greetingKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'greeting';
            }
        }

        $goodbyeKeywords = ['adios', 'adiós', 'hasta luego', 'nos vemos', 'bye', 'chao', 'chau', 'hasta pronto', 'cuidate', 'cuídate', 'nos leemos', 'me voy', 'salir'];
        foreach ($goodbyeKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'goodbye';
            }
        }

        $thanksKeywords = ['gracias', 'muchas gracias', 'te agradezco', 'mil gracias', 'super', 'súper', 'genial', 'excelente', 'perfecto', 'muy bien', 'chido'];
        foreach ($thanksKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'thanks';
            }
        }

        $helpKeywords = ['ayuda', 'que puedes hacer', 'qué puedes hacer', 'como funcionas', 'cómo funcionas', 'no entiendo', 'auxilio', 'comandos', 'que hago', 'qué hago', 'para que sirves', 'para qué sirves', 'como me ayudas'];
        foreach ($helpKeywords as $word) {
            if ($this->contains($normalizedMessage, $word)) {
                return 'help';
            }
        }

        return 'movie_query';
    }

    private function buildBuyTicketsResponse(array $catalog): array
    {
        if (
            isset($_SESSION['last_movie']) &&
            !empty($_SESSION['last_movie'])
        ) {

            $movie = $_SESSION['last_movie'];

            return [
                'success' => true,
                'message' =>
                    "🎟️ Perfecto.\n\n" .
                    "¿Qué día y horario quieres para:\n\n" .
                    "🍿 {$movie['title']}?"
            ];
        }

        return [
            'success' => true,
            'message' =>
                '🎟️ Claro. ¿Para qué película quieres comprar boletos?'
        ];
    }

    private function extractQuotedText(string $message): ?string
    {
        if (preg_match('/"([^"]+)"/', $message, $matches)) {
            return trim($matches[1]);
        }

        if (preg_match("/'([^']+)'/", $message, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    private function normalizeText(string $text): string
    {
        $text = trim($text);
        $text = strip_tags($text);
        $text = mb_strtolower($text, 'UTF-8');

        if (function_exists('transliterator_transliterate')) {
            $text = transliterator_transliterate('Any-Latin; Latin-ASCII', $text);
        } else {
            $converted = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
            if ($converted !== false) {
                $text = $converted;
            }
        }

        $replacements = [
            'alas' => 'a las',
            'al as' => 'a las',
            'alas8' => 'a las 8',
            'alas9' => 'a las 9',
            'alas10' => 'a las 10',
            '7pm' => '7 pm',
            '8pm' => '8 pm',
            '9pm' => '9 pm',
            '10pm' => '10 pm',
            '7am' => '7 am',
            '8am' => '8 am',
            '9am' => '9 am',
            '10am' => '10 am'
        ];
        $text = str_replace(array_keys($replacements), array_values($replacements), $text);

        $text = preg_replace('/[^a-z0-9:\s]+/i', ' ', $text);
        $text = preg_replace('/\s+/', ' ', (string) $text);

        return trim((string) $text);
    }

    private function contains(string $haystack, string $needle): bool
    {
        if ($needle === '') {
            return false;
        }

        return mb_stripos($haystack, $needle, 0, 'UTF-8') !== false;
    }
}