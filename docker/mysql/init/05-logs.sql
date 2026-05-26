CREATE TABLE logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),

    request_id CHAR(36) NULL,
    token_jti VARCHAR(255) NULL, 

    user_id CHAR(36) NULL,
    user_role ENUM('user', 'manager', 'admin') NULL, 

    action VARCHAR(100) NOT NULL, 
    severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',

    ip_address VARCHAR(45),
    user_agent TEXT,

    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INT,

    message TEXT NOT NULL,
    context JSON, 

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_logs_action (action),
    INDEX idx_logs_user_role (user_role),
    INDEX idx_logs_created_at (created_at)
);