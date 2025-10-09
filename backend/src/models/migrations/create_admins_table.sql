-- DEPRECATED LEGACY FILE: superseded by numbered migration 01_create_admins_table.sql. Kept only for historical reference; do NOT modify or rely on this file.
-- This file will be ignored because runner dedupes first occurrence of filename pattern.
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('super_admin','admin','moderator','viewer') NOT NULL,
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  password VARCHAR(255) NOT NULL,
  twoFactorEnabled BOOLEAN DEFAULT FALSE,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
