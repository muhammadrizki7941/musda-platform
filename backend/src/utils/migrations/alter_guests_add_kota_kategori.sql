-- Adds optional city (kota) and category (kategori) to guests table
-- Safe to run multiple times: checks column existence first

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS kota VARCHAR(100) NULL AFTER asal_instansi,
  ADD COLUMN IF NOT EXISTS kategori VARCHAR(100) NULL AFTER kota;
