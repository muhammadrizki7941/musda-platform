-- 01_create_admins_table.sql
-- Consolidated admin table (with username + last_login) for authentication
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('super_admin','admin','moderator','viewer') NOT NULL DEFAULT 'admin',
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  password VARCHAR(255) NOT NULL,
  twoFactorEnabled BOOLEAN DEFAULT FALSE,
  avatar VARCHAR(255),
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admins_role (role),
  INDEX idx_admins_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;