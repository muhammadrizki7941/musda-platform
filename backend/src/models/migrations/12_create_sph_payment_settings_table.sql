-- 12_create_sph_payment_settings_table.sql
CREATE TABLE IF NOT EXISTS sph_payment_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type ENUM('text','number','boolean','json') DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sph_payment_settings (setting_key, setting_value, setting_type, description) VALUES
('payment_method_qris','true','boolean','Enable QRIS payment method'),
('payment_method_manual','true','boolean','Enable manual bank transfer'),
('price_general','150000','number','Price for general category (Rp)'),
('price_student','100000','number','Price for student category (Rp)'),
('bank_name','Bank Mandiri','text','Bank name for manual transfer'),
('bank_account_number','1234567890','text','Bank account number'),
('bank_account_name','Himperra Lampung','text','Bank account holder name'),
('qris_enabled','true','boolean','QRIS payment availability'),
('payment_instructions','Transfer ke rekening di atas dan konfirmasi pembayaran','text','Payment instructions for users'),
('contact_admin','+62 812-3456-7890','text','Admin contact for payment confirmation')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), updated_at=CURRENT_TIMESTAMP;