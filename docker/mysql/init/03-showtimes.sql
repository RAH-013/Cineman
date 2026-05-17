CREATE TABLE showtimes (
    id CHAR(36) PRIMARY KEY,

    movie_id CHAR(36) NOT NULL,

    room ENUM(
        '1',
        '2',
        '3',
        '4',
        '5'
    ) NOT NULL,

    start_time DATETIME NOT NULL,

    language ENUM(
        'SUB',
        'ESP'
    ) NOT NULL,

    format ENUM(
        '2D',
        '3D',
        'IMAX'
    ) NOT NULL DEFAULT '2D',

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