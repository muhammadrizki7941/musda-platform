-- Migration untuk membuat tabel sph_content
-- File: create_sph_content_table.sql

CREATE TABLE IF NOT EXISTS sph_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    content_key VARCHAR(100) NOT NULL,
    content_value TEXT,
    content_type ENUM('text', 'html', 'number', 'boolean', 'datetime') DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_section_key (section, content_key),
    INDEX idx_section (section)
);

-- Insert default content untuk SPH
INSERT INTO sph_content (section, content_key, content_value, content_type, description) VALUES
-- Hero section
('hero', 'title', 'Sekolah Properti Himperra', 'text', 'Main title for hero section'),
('hero', 'subtitle', 'Membangun Masa Depan Properti Indonesia', 'text', 'Subtitle for hero section'),
('hero', 'description', 'Program pendidikan terdepan untuk mengembangkan pengetahuan dan keterampilan di bidang properti dengan standar internasional.', 'text', 'Hero description'),
('hero', 'cta_text', 'Daftar Sekarang', 'text', 'Call to action button text'),

-- Features section
('features', 'feature_1_text', '50+ Peserta Terbatas', 'text', 'First feature pill text'),
('features', 'feature_1_icon', 'Users', 'text', 'Icon name for first feature'),
('features', 'feature_2_text', '6 Jam Intensif', 'text', 'Second feature pill text'),
('features', 'feature_2_icon', 'Clock', 'text', 'Icon name for second feature'),
('features', 'feature_3_text', 'Sertifikat Resmi', 'text', 'Third feature pill text'),
('features', 'feature_3_icon', 'Award', 'text', 'Icon name for third feature'),
('features', 'feature_4_text', 'Modul Lengkap', 'text', 'Fourth feature pill text'),
('features', 'feature_4_icon', 'BookOpen', 'text', 'Icon name for fourth feature'),

-- Countdown section
('countdown', 'title', 'Segera Daftar!', 'text', 'Title for countdown section'),
('countdown', 'subtitle', 'Jangan sampai terlewat kesempatan emas ini untuk mengembangkan skill properti Anda!', 'text', 'Subtitle for countdown section'),

-- About section
('about', 'title', 'Tentang Sekolah Properti', 'text', 'About section title'),
('about', 'description', 'Program intensif yang dirancang khusus untuk memberikan pemahaman mendalam tentang investasi properti', 'text', 'About section description');