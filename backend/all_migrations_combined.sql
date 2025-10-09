\-- FILE: src/models/migrations/create_admins_table.sql
\
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
\
\
\-- FILE: src/migrations/create_content_and_settings_tables.sql
\
-- Create content table for content management
CREATE TABLE IF NOT EXISTS content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  type ENUM('page', 'post', 'news') DEFAULT 'page',
  meta_description TEXT,
  featured_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create system_settings table for system configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'MUSDA HIMPERRA', 'Website name'),
('site_description', 'Musyawarah Daerah HIMPERRA Lampung', 'Website description'),
('registration_open', 'true', 'Enable/disable registration'),
('max_participants', '500', 'Maximum number of participants'),
('email_notifications', 'true', 'Enable email notifications'),
('maintenance_mode', 'false', 'Enable maintenance mode');
\
\
\-- FILE: src/utils/migrations/create_gallery_items_table.sql
\
CREATE TABLE gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO gallery_items (image_url, description, sort_order) VALUES
('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop', 'Sesi presentasi materi investasi properti', 1),
('https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&h=400&fit=crop', 'Networking session dengan para peserta', 2),
('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop', 'Diskusi analisis studi kasus properti', 3),
('https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=400&fit=crop', 'Workshop evaluasi investasi properti', 4),
('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop', 'Penyerahan sertifikat kepada peserta', 5),
('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', 'Foto bersama seluruh peserta dan instruktur', 6);
\
\
\-- FILE: src/models/migrations/create_news_tables.sql
\
-- Migration: create news feature tables
CREATE TABLE IF NOT EXISTS news_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  excerpt TEXT,
  content_html LONGTEXT,
  content_text LONGTEXT,
  thumbnail_path VARCHAR(255),
  seo_title VARCHAR(180),
  seo_description VARCHAR(255),
  seo_keywords VARCHAR(255),
  canonical_url VARCHAR(255),
  is_published TINYINT(1) DEFAULT 0,
  published_at DATETIME NULL,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_by INT NULL,
  updated_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_news_published (is_published, published_at),
  INDEX idx_news_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  user_email VARCHAR(180) NULL,
  content TEXT NOT NULL,
  is_approved TINYINT(1) DEFAULT 0,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  INDEX idx_comments_article (article_id),
  INDEX idx_comments_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  client_fingerprint VARCHAR(64) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_news_like (article_id, client_fingerprint),
  FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  INDEX idx_likes_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
\
\
\-- FILE: src/utils/migrations/create_poster_flyers_table.sql
\
-- Create poster_flyers table for managing promotional materials
CREATE TABLE IF NOT EXISTS poster_flyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO poster_flyers (image_url, title, description, is_active) VALUES
('https://via.placeholder.com/400x400/FFD700/000000?text=Poster+Sekolah+Properti', 'Event Eksklusif HIMPERRA', 'Jangan lewatkan kesempatan emas untuk mengembangkan skill properti Anda!', TRUE);
\
\
\-- FILE: src/models/migrations/create_sph_content_table.sql
\
-- Create table for SPH (Sekolah Properti) content management
CREATE TABLE IF NOT EXISTS sph_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    content_key VARCHAR(100) NOT NULL,
    content_value TEXT,
    content_type ENUM('text', 'html', 'image', 'number', 'boolean', 'json') DEFAULT 'text',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_section_key (section, content_key)
);

-- Insert default content for SPH
-- Note: Some environments previously created sph_content without the description column.
-- To stay compatible, we only insert into existing base columns. If description exists, it will accept NULL default.
INSERT INTO sph_content (section, content_key, content_value, content_type) VALUES
-- Hero Section
('hero', 'title', 'Sekolah Properti Himperra', 'text'),
('hero', 'subtitle', 'Membangun Masa Depan Properti Indonesia', 'text'),
('hero', 'description', 'Program pendidikan terdepan untuk mengembangkan pengetahuan dan keterampilan di bidang properti dengan standar internasional.', 'text'),
('hero', 'background_image', '/images/sph-hero-bg.jpg', 'image'),
('hero', 'cta_text', 'Daftar Sekarang', 'text'),

-- About Section
('about', 'title', 'Tentang Sekolah Properti', 'text'),
('about', 'description', 'Sekolah Properti Himperra adalah institusi pendidikan yang fokus pada pengembangan SDM di bidang properti. Kami menyediakan kurikulum yang komprehensif dan up-to-date dengan perkembangan industri properti.', 'html'),
('about', 'vision', 'Menjadi pusat pendidikan properti terdepan di Indonesia', 'text'),
('about', 'mission', 'Menghasilkan profesional properti yang kompeten dan berintegritas', 'text'),

-- Features Section
('features', 'title', 'Keunggulan Program', 'text'),
('features', 'feature_1_title', 'Kurikulum Terkini', 'text'),
('features', 'feature_1_desc', 'Materi pembelajaran yang selalu update dengan trend industri', 'text'),
('features', 'feature_2_title', 'Instruktur Berpengalaman', 'text'),
('features', 'feature_2_desc', 'Diajar oleh praktisi dan akademisi berpengalaman', 'text'),
('features', 'feature_3_title', 'Sertifikasi Resmi', 'text'),
('features', 'feature_3_desc', 'Mendapat sertifikat yang diakui industri', 'text'),

-- Contact Section
('contact', 'title', 'Hubungi Kami', 'text'),
('contact', 'address', 'Jl. Properti No. 123, Jakarta Selatan', 'text'),
('contact', 'phone', '+62 21 1234 5678', 'text'),
('contact', 'email', 'info@sekolahproperti.id', 'text'),
('contact', 'whatsapp', '+62 812 3456 7890', 'text'),

-- Registration Section
('registration', 'title', 'Pendaftaran', 'text'),
('registration', 'price', '2500000', 'number'),
('registration', 'early_bird_price', '2000000', 'number'),
('registration', 'early_bird_deadline', '2025-12-31', 'text'),
('registration', 'description', 'Bergabunglah dengan program Sekolah Properti dan kembangkan karier Anda di bidang properti', 'text'),

-- Settings
('settings', 'is_registration_open', 'true', 'boolean'),
('settings', 'max_participants', '100', 'number'),
('settings', 'show_early_bird', 'true', 'boolean'),
('settings', 'site_title', 'Sekolah Properti Himperra', 'text'),
('settings', 'site_description', 'Program pendidikan properti terdepan di Indonesia', 'text');
\
\
\-- FILE: src/utils/migrations/create_sph_participants_table.sql
\
-- Migration untuk membuat tabel sph_participants
-- File: create_sph_participants_table.sql

CREATE TABLE IF NOT EXISTS sph_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    institution VARCHAR(255),
    experience_level ENUM('pemula', 'menengah', 'lanjutan') DEFAULT 'pemula',
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('qris', 'manual') DEFAULT 'qris',
    payment_code VARCHAR(50),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP NULL,
    qr_code_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_payment_status (payment_status),
    INDEX idx_registration_date (registration_date)
);
\
\
\-- FILE: src/models/migrations/create_sph_payment_settings_table.sql
\
-- Create SPH Payment Settings Table
CREATE TABLE IF NOT EXISTS sph_payment_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default payment settings
INSERT INTO sph_payment_settings (setting_key, setting_value, setting_type, description) VALUES
('payment_method_qris', 'true', 'boolean', 'Enable QRIS payment method'),
('payment_method_manual', 'true', 'boolean', 'Enable manual bank transfer'),
('price_general', '150000', 'number', 'Price for general category (Rp)'),
('price_student', '100000', 'number', 'Price for student category (Rp)'),
('bank_name', 'Bank Mandiri', 'text', 'Bank name for manual transfer'),
('bank_account_number', '1234567890', 'text', 'Bank account number'),
('bank_account_name', 'Himperra Lampung', 'text', 'Bank account holder name'),
('qris_enabled', 'true', 'boolean', 'QRIS payment availability'),
('payment_instructions', 'Transfer ke rekening di atas dan konfirmasi pembayaran', 'text', 'Payment instructions for users'),
('contact_admin', '+62 812-3456-7890', 'text', 'Admin contact for payment confirmation')
ON DUPLICATE KEY UPDATE 
  setting_value = VALUES(setting_value),
  updated_at = CURRENT_TIMESTAMP;
\
\
\-- FILE: src/utils/migrations/create_sph_settings_table.sql
\
-- Migration untuk membuat tabel sph_settings
-- File: create_sph_settings_table.sql

CREATE TABLE IF NOT EXISTS sph_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    countdown_target_date DATETIME NOT NULL,
    max_participants INT NOT NULL DEFAULT 50,
    current_participants INT NOT NULL DEFAULT 0,
    registration_open BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO sph_settings (countdown_target_date, max_participants, current_participants, registration_open) 
VALUES ('2024-12-31 23:59:59', 50, 0, TRUE);
\
\
\-- FILE: src/utils/migrations/create_sponsors_table.sql
\
CREATE TABLE IF NOT EXISTS sponsors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(255) NOT NULL,
  category ENUM('emerald','platinum','gold','silver','bronze','harmony') NOT NULL
);
\
\
\-- FILE: src/migrations/create_users_table.sql
\
-- Script untuk membuat tabel users jika belum ada
CREATE TABLE IF NOT EXISTS users (
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
);

-- Index untuk optimasi query
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
\
\
\-- FILE: src/utils/migrations/alter_guests_add_kota_kategori.sql
\
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
\
\
\-- FILE: src/models/migrations/alter_users_table_for_adminmanagement.sql
\
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
\
\
