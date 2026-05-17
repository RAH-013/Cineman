CREATE TABLE tickets (
    id CHAR(36) PRIMARY KEY,

    user_id CHAR(36) NOT NULL,

    showtime_id CHAR(36) NOT NULL,

    seat_row ENUM(
        'A',
        'B',
        'C',
        'D',
        'E'
    ) NOT NULL,

    seat_number INT NOT NULL
    CHECK (seat_number BETWEEN 1 AND 10),

    total_price DECIMAL(10,2) NOT NULL,

    status ENUM(
        'reserved',
        'paid'
    ) NOT NULL DEFAULT 'reserved',

    expires_at DATETIME NOT NULL,

    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tickets_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tickets_showtime
        FOREIGN KEY (showtime_id)
        REFERENCES showtimes(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_ticket_seat
        UNIQUE (
            showtime_id,
            seat_row,
            seat_number
        ),

    INDEX idx_tickets_user (user_id),

    INDEX idx_tickets_showtime (showtime_id),

    INDEX idx_tickets_status (status),

    INDEX idx_tickets_expires (expires_at)
);