-- Migration untuk membuat tabel sph_settings
-- File: create_sph_settings_table.sql

CREATE TABLE IF NOT EXISTS sph_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    countdown_target_date DATETIME NOT NULL,
    max_participants INT NOT NULL DEFAULT 50,
    current_participants INT NOT NULL DEFAULT 0,
    registration_open BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO sph_settings (countdown_target_date, max_participants, current_participants, registration_open) 
VALUES ('2024-12-31 23:59:59', 50, 0, TRUE);