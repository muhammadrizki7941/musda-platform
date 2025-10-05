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
