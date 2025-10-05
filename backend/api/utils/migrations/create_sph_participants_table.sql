-- Migration untuk membuat tabel sph_participants
-- File: create_sph_participants_table.sql

CREATE TABLE IF NOT EXISTS sph_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    institution VARCHAR(255),
    experience_level ENUM('pemula', 'menengah', 'lanjutan') DEFAULT 'pemula',
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('qris', 'manual') DEFAULT 'qris',
    payment_code VARCHAR(50),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP NULL,
    qr_code_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_payment_status (payment_status),
    INDEX idx_registration_date (registration_date)
);