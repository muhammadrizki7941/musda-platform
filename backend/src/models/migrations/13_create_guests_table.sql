-- 13_create_guests_table.sql
-- Create guests table used by participantRoutes and guestController
-- This table was missing in earlier numbered migrations; controllers expect these columns.
CREATE TABLE IF NOT EXISTS guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  whatsapp VARCHAR(30) NOT NULL,
  asal_instansi VARCHAR(150) NOT NULL,
  kota VARCHAR(100) NULL,
  kategori VARCHAR(100) NULL,
  status_kehadiran ENUM('pending','hadir') DEFAULT 'pending',
  qr_code VARCHAR(191) NULL,
  verification_token VARCHAR(191) NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_guests_whatsapp (whatsapp),
  INDEX idx_guests_status (status_kehadiran),
  INDEX idx_guests_token (verification_token)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Note: Removed ALTER ... IF NOT EXISTS for MySQL 5.7 compatibility.
-- If you had an older minimal guests table, you must manually migrate it:
--   ALTER TABLE guests ADD COLUMN kota VARCHAR(100) NULL;
--   ALTER TABLE guests ADD COLUMN kategori VARCHAR(100) NULL;
--   ALTER TABLE guests ADD COLUMN qr_code VARCHAR(191) NULL;
--   ALTER TABLE guests ADD COLUMN verification_token VARCHAR(191) NULL;
--   ALTER TABLE guests ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
--   ALTER TABLE guests ADD COLUMN status_kehadiran ENUM('pending','hadir') DEFAULT 'pending';
--   CREATE INDEX idx_guests_status ON guests (status_kehadiran);
--   CREATE INDEX idx_guests_token ON guests (verification_token);
