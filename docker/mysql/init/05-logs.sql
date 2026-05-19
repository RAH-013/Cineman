CREATE TABLE logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),

    -- Trazabilidad de la Petición y Sesión (JWT)
    request_id CHAR(36) NULL,
    token_jti VARCHAR(255) NULL, -- Identificador único del JWT

    -- Identidad y Acceso
    user_id CHAR(36) NULL,
    user_role ENUM('user', 'manager', 'admin') NULL, -- Extraído del payload de tu JWT

    -- Comportamiento del Usuario
    action VARCHAR(100) NOT NULL, -- Ej: 'login_success', 'view_dashboard', 'export_pdf'
    severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',

    -- Contexto de Red
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Contexto de la API (PHP/Apache)
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INT,

    -- Datos Específicos
    message TEXT NOT NULL,
    context JSON, -- MySQL 8.4 tiene un rendimiento excelente con el tipo JSON

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relaciones
    CONSTRAINT fk_user_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    -- Índices optimizados para las consultas de tu día a día
    INDEX idx_logs_action (action),
    INDEX idx_logs_user_role (user_role),
    INDEX idx_logs_created_at (created_at)
);