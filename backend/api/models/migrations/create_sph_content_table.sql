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
INSERT INTO sph_content (section, content_key, content_value, content_type, description) VALUES
-- Hero Section
('hero', 'title', 'Sekolah Properti Himperra', 'text', 'Judul utama halaman'),
('hero', 'subtitle', 'Membangun Masa Depan Properti Indonesia', 'text', 'Subjudul halaman'),
('hero', 'description', 'Program pendidikan terdepan untuk mengembangkan pengetahuan dan keterampilan di bidang properti dengan standar internasional.', 'text', 'Deskripsi hero section'),
('hero', 'background_image', '/images/sph-hero-bg.jpg', 'image', 'Background image hero section'),
('hero', 'cta_text', 'Daftar Sekarang', 'text', 'Teks tombol call-to-action'),

-- About Section
('about', 'title', 'Tentang Sekolah Properti', 'text', 'Judul section tentang'),
('about', 'description', 'Sekolah Properti Himperra adalah institusi pendidikan yang fokus pada pengembangan SDM di bidang properti. Kami menyediakan kurikulum yang komprehensif dan up-to-date dengan perkembangan industri properti.', 'html', 'Deskripsi lengkap tentang SPH'),
('about', 'vision', 'Menjadi pusat pendidikan properti terdepan di Indonesia', 'text', 'Visi SPH'),
('about', 'mission', 'Menghasilkan profesional properti yang kompeten dan berintegritas', 'text', 'Misi SPH'),

-- Features Section
('features', 'title', 'Keunggulan Program', 'text', 'Judul section keunggulan'),
('features', 'feature_1_title', 'Kurikulum Terkini', 'text', 'Judul fitur 1'),
('features', 'feature_1_desc', 'Materi pembelajaran yang selalu update dengan trend industri', 'text', 'Deskripsi fitur 1'),
('features', 'feature_2_title', 'Instruktur Berpengalaman', 'text', 'Judul fitur 2'),
('features', 'feature_2_desc', 'Diajar oleh praktisi dan akademisi berpengalaman', 'text', 'Deskripsi fitur 2'),
('features', 'feature_3_title', 'Sertifikasi Resmi', 'text', 'Judul fitur 3'),
('features', 'feature_3_desc', 'Mendapat sertifikat yang diakui industri', 'text', 'Deskripsi fitur 3'),

-- Contact Section
('contact', 'title', 'Hubungi Kami', 'text', 'Judul section kontak'),
('contact', 'address', 'Jl. Properti No. 123, Jakarta Selatan', 'text', 'Alamat'),
('contact', 'phone', '+62 21 1234 5678', 'text', 'Nomor telepon'),
('contact', 'email', 'info@sekolahproperti.id', 'text', 'Email'),
('contact', 'whatsapp', '+62 812 3456 7890', 'text', 'WhatsApp untuk kontak'),

-- Registration Section
('registration', 'title', 'Pendaftaran', 'text', 'Judul section pendaftaran'),
('registration', 'price', '2500000', 'number', 'Harga pendaftaran dalam Rupiah'),
('registration', 'early_bird_price', '2000000', 'number', 'Harga early bird'),
('registration', 'early_bird_deadline', '2025-12-31', 'text', 'Deadline early bird'),
('registration', 'description', 'Bergabunglah dengan program Sekolah Properti dan kembangkan karier Anda di bidang properti', 'text', 'Deskripsi pendaftaran'),

-- Settings
('settings', 'is_registration_open', 'true', 'boolean', 'Status pembukaan pendaftaran'),
('settings', 'max_participants', '100', 'number', 'Maksimal peserta'),
('settings', 'show_early_bird', 'true', 'boolean', 'Tampilkan harga early bird'),
('settings', 'site_title', 'Sekolah Properti Himperra', 'text', 'Title website'),
('settings', 'site_description', 'Program pendidikan properti terdepan di Indonesia', 'text', 'Meta description website');