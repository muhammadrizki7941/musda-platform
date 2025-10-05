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