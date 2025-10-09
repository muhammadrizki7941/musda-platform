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