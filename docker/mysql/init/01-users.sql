CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id CHAR(36) PRIMARY KEY,
    name VARCHAR(30),
    lastname VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO users (
    id,
    email,
    password,
    role
)
VALUES
(
    UUID(),
    'admin@cineman.com',
    '$2y$12$ykGsKbSnO4I9NCLlj1T2Oueci8knJGCfzLsjWFEvcwcVQQKPozGkm',
    'admin'
),
(
    UUID(),
    'manager@cineman.com',
    '$2y$12$fCPsfmUJ8f0.0Sp0P2NfneItpCo91XMl0a9Hg1ggiOeZR/gSzBlae',
    'manager'
);

INSERT INTO user_profiles (user_id)
SELECT id
FROM users
WHERE email IN (
    'admin@cineman.com',
    'manager@cineman.com'
);