-- Create sph_payment_settings table
CREATE TABLE IF NOT EXISTS sph_payment_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type ENUM('text', 'number', 'boolean', 'json') NOT NULL DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default payment settings
INSERT INTO sph_payment_settings (setting_key, setting_value, setting_type, description) VALUES
('sph_price', '50000', 'number', 'Harga pendaftaran SPH dalam rupiah'),
('bank_name', 'Bank BCA', 'text', 'Nama bank untuk pembayaran'),
('account_number', '1234567890', 'text', 'Nomor rekening untuk pembayaran'),
('account_holder', 'HIMPERRA LAMPUNG', 'text', 'Nama pemilik rekening'),
('payment_instructions', 'Transfer ke rekening di atas dan kirim bukti pembayaran', 'text', 'Instruksi pembayaran untuk peserta'),
('enable_bank_transfer', 'true', 'boolean', 'Aktifkan metode pembayaran transfer bank'),
('enable_ewallet', 'false', 'boolean', 'Aktifkan metode pembayaran e-wallet'),
('enable_cash', 'false', 'boolean', 'Aktifkan metode pembayaran tunai')
ON DUPLICATE KEY UPDATE
  setting_value = VALUES(setting_value),
  setting_type = VALUES(setting_type),
  description = VALUES(description),
  updated_at = CURRENT_TIMESTAMP;