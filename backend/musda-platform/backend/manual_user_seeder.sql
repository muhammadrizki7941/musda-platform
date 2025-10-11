-- ====================================================
-- MUSDA USER SEEDER - Manual SQL Script
-- Jalankan di phpMyAdmin -> SQL tab
-- ====================================================

-- Pilih database musda
USE musda;

-- Hapus tabel users lama jika ada masalah
DROP TABLE IF EXISTS users;

-- Buat tabel users baru
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin','moderator','viewer','user') NOT NULL DEFAULT 'user',
  nama VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  twoFactorEnabled BOOLEAN DEFAULT FALSE,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert users dengan password yang sudah di-hash
-- Password: superadmin123, admin123, panitia123, viewer123
INSERT INTO users (username, password, role, nama, email, status) VALUES
('superadmin', '$2b$10$lZVfQ1FYCGjDpdj/4s.hE.Pjkxe0F94Ha8oLxnvp1933zspyrKMR2', 'super_admin', 'Super Administrator', 'superadmin@himperra.com', 'active'),
('admin', '$2b$10$5n6CXnP2KnW5zAtfBWOmRO3tA8w0JuGgmGtrqL.d34FIa8MjJ34La', 'admin', 'Administrator', 'admin@himperra.com', 'active'),
('panitia', '$2b$10$usz8wgVoR67PtLd1zouC2eBbFeerrF9ogukeK.2S9lkrG9/qGpI3y', 'moderator', 'Panitia MUSDA', 'panitia@himperra.com', 'active'),
('viewer', '$2b$10$L.hX0nUs94KurXtSm6QPDOxizzTKrAY0iShZ.jllYEv6w414aM8jy', 'viewer', 'Viewer', 'viewer@himperra.com', 'active');

-- Buat index untuk optimasi
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Tampilkan hasil
SELECT 'Users berhasil dibuat!' as message;
SELECT id, username, role, nama, email, status, created_at FROM users;

-- ====================================================
-- LOGIN CREDENTIALS:
-- ====================================================
-- Username: superadmin | Password: superadmin123 | Role: super_admin
-- Username: admin      | Password: admin123      | Role: admin  
-- Username: panitia    | Password: panitia123    | Role: moderator
-- Username: viewer     | Password: viewer123     | Role: viewer
-- ====================================================