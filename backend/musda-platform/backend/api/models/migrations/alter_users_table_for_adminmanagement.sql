-- Improvisasi tabel users agar bisa dipakai untuk admin management
ALTER TABLE users
  ADD COLUMN status ENUM('active','inactive','suspended') DEFAULT 'active',
  ADD COLUMN twoFactorEnabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN avatar VARCHAR(255),
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Pastikan kolom role sudah ada dan bisa menampung level admin
-- Jika belum, bisa diubah menjadi ENUM('super_admin','admin','moderator','viewer','user')
ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','admin','moderator','viewer','user') NOT NULL DEFAULT 'user';
