CREATE TABLE showtimes (
    id CHAR(36) PRIMARY KEY,

    movie_id CHAR(36) NOT NULL,

    room INT NOT NULL
    CHECK (room BETWEEN 1 AND 10),

    start_time DATETIME NOT NULL,

    language ENUM(
        'Subtitulada',
        'Doblada'
    ) NOT NULL,

    format ENUM(
        'Tradicional',
        '3D',
        'IMAX'
    ) NOT NULL DEFAULT 'Tradicional',

    price DECIMAL(10,2) NOT NULL
    CHECK (price >= 0),

    available_seats INT NOT NULL DEFAULT 50
    CHECK (available_seats BETWEEN 0 AND 50),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_showtimes_movie
        FOREIGN KEY (movie_id)
        REFERENCES movies(id)
        ON DELETE CASCADE,

    INDEX idx_showtimes_movie (movie_id),

    INDEX idx_showtimes_start_time (start_time)
);