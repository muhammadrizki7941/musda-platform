-- Adds optional city (kota) and category (kategori) to guests table
-- Safe to run multiple times: checks column existence first

-- MySQL tidak mendukung ADD COLUMN IF NOT EXISTS (baru di versi sangat baru / berbeda implementasi),
-- jadi kita cek manual via information_schema dan jalankan dinamis.

SET @stmt := NULL;
SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='guests' AND COLUMN_NAME='kota'),
  'SELECT "kolom kota sudah ada"',
  'ALTER TABLE guests ADD COLUMN kota VARCHAR(100) NULL AFTER asal_instansi'
) INTO @stmt;
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt2 := NULL;
SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='guests' AND COLUMN_NAME='kategori'),
  'SELECT "kolom kategori sudah ada"',
  'ALTER TABLE guests ADD COLUMN kategori VARCHAR(100) NULL AFTER kota'
) INTO @stmt2;
PREPARE stmt2 FROM @stmt2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;
