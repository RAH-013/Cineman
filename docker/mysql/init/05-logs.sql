CREATE TABLE logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id CHAR(36) NULL,

    event_type VARCHAR(60) NOT NULL,
    severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',

    ip_address VARCHAR(45),
    user_agent TEXT,

    endpoint VARCHAR(255),
    method VARCHAR(10),

    message TEXT NOT NULL,
    context JSON,

    status_code INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_security_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);