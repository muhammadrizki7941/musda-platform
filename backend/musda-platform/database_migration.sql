-- Connect to database and create missing tables for admin dashboard
USE musda1;

-- 1. Create content table for content management
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);

-- 2. Create system_settings table for system configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
);

-- 3. Insert default system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'MUSDA HIMPERRA', 'Website name'),
('site_description', 'Musyawarah Daerah HIMPERRA Lampung', 'Website description'),
('registration_open', 'true', 'Enable/disable registration'),
('max_participants', '500', 'Maximum number of participants'),
('email_notifications', 'true', 'Enable email notifications'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('contact_email', 'admin@himperra.org', 'Contact email address'),
('contact_phone', '+62-XXX-XXXX-XXXX', 'Contact phone number');

-- 4. Create admin_activities table for activity logging
CREATE TABLE IF NOT EXISTS admin_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  activity_type ENUM('login', 'logout', 'create', 'update', 'delete', 'export') NOT NULL,
  target_type VARCHAR(50), -- 'user', 'content', 'sponsor', etc.
  target_id INT,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
);

-- 5. Insert sample content for testing
INSERT IGNORE INTO content (title, slug, content, status, type, meta_description) VALUES
('Welcome to MUSDA', 'welcome-musda', '<h1>Selamat Datang di MUSDA HIMPERRA</h1><p>Musyawarah Daerah HIMPERRA Lampung</p>', 'published', 'page', 'Halaman selamat datang MUSDA HIMPERRA'),
('Event Information', 'event-info', '<h2>Informasi Acara</h2><p>Detail lengkap tentang acara MUSDA</p>', 'published', 'page', 'Informasi lengkap acara MUSDA'),
('Registration Guide', 'registration-guide', '<h2>Panduan Pendaftaran</h2><p>Cara mendaftar untuk mengikuti acara MUSDA</p>', 'published', 'post', 'Panduan pendaftaran MUSDA');

-- 6. Check if tables exist and show structure
SHOW TABLES LIKE 'content';
SHOW TABLES LIKE 'system_settings';
SHOW TABLES LIKE 'admin_activities';

-- 7. Show sample data
SELECT 'Content table sample:' as info;
SELECT id, title, slug, status, type, created_at FROM content LIMIT 3;

SELECT 'System settings sample:' as info;
SELECT setting_key, setting_value, description FROM system_settings LIMIT 5;

SELECT 'Database migration completed successfully!' as result;