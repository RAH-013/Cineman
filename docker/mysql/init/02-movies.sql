CREATE TABLE movies (
    id CHAR(36) PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    director VARCHAR(255) NOT NULL,

    synopsis TEXT NOT NULL,

    genres SET(
        'accion',
        'aventura',
        'animada',
        'comedia',
        'crimen',
        'drama',
        'fantasia',
        'horror',
        'romance',
        'sci_fi',
        'thriller',
        'misterio',
        'videojuego',
        'terror',
        'noir'
    ) NOT NULL,

    duration_minutes INT NOT NULL,

    classification ENUM(
        'AA',
        'A',
        'B',
        'B15',
        'C',
        'D'
    ) NOT NULL,

    release_date DATE NOT NULL,

    poster_url TEXT,

    trailer_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);