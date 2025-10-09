-- DEPRECATED LEGACY SCRIPT: Do NOT use. Schema now managed by numbered migrations in src/models/migrations.
-- This file retained only for historical reference.
CREATE DATABASE IF NOT EXISTS musda_db;
USE musda_db;

-- Table: sponsors
CREATE TABLE IF NOT EXISTS sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_path VARCHAR(500),
    website_url VARCHAR(500),
    status ENUM('active', 'inactive') DEFAULT 'active',
    display_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: agendas
CREATE TABLE IF NOT EXISTS agendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    agenda_date DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: gallery_items
CREATE TABLE IF NOT EXISTS gallery_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_path VARCHAR(500) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: countdown
CREATE TABLE IF NOT EXISTS countdown (
    id INT PRIMARY KEY DEFAULT 1,
    countdown_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: admins
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: sph_participants
CREATE TABLE IF NOT EXISTS sph_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    organization VARCHAR(255),
    payment_status ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: poster_flyers
CREATE TABLE IF NOT EXISTS poster_flyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data
INSERT IGNORE INTO countdown (id, countdown_date) VALUES (1, '2025-12-31 17:00:00');

INSERT IGNORE INTO admins (username, password, role) VALUES ('admin', 'admin123', 'super_admin');

-- Insert sample sponsors
INSERT IGNORE INTO sponsors (id, name, logo_path, website_url, status, display_order) VALUES 
(1, 'HIMPERRA Lampung', '/images/logo-himperra.png', 'https://himperra.org', 'active', 1),
(2, 'MUSDA Sponsor', '/images/logo-musda.png', 'https://musda.org', 'active', 2);

-- Insert sample agendas
INSERT IGNORE INTO agendas (id, title, description, start_time, end_time, agenda_date, location) VALUES 
(1, 'MUSDA HIMPERRA Lampung', 'Musyawarah Daerah HIMPERRA Lampung', '09:00:00', '17:00:00', '2025-12-31', 'Lampung');

-- Insert sample gallery
INSERT IGNORE INTO gallery_items (id, image_path, description, display_order) VALUES 
(1, '/images/gallery-1.jpg', 'Gallery Item 1', 1),
(2, '/images/gallery-2.jpg', 'Gallery Item 2', 2),
(3, '/images/gallery-3.jpg', 'Gallery Item 3', 3);

-- Insert sample SPH participants
INSERT IGNORE INTO sph_participants (id, name, email, phone, organization, payment_status) VALUES 
(1, 'John Doe', 'john@example.com', '081234567890', 'Company A', 'confirmed'),
(2, 'Jane Smith', 'jane@example.com', '081234567891', 'Company B', 'pending'),
(3, 'Bob Wilson', 'bob@example.com', '081234567892', 'Company C', 'confirmed'),
(4, 'Alice Brown', 'alice@example.com', '081234567893', 'Company D', 'pending');