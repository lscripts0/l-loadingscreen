CREATE TABLE IF NOT EXISTS l_loadingscreen_consent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier  VARCHAR(60) NOT NULL,
    name        VARCHAR(64),
    ip          VARCHAR(45),
    version     INT NOT NULL,
    accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier (identifier)
);
