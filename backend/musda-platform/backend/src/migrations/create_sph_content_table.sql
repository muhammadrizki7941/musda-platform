-- Create sph_content table for managing SPH website content
CREATE TABLE IF NOT EXISTS sph_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section VARCHAR(100) NOT NULL,
  content_key VARCHAR(100) NOT NULL,
  content_value TEXT,
  content_type ENUM('text', 'textarea', 'html', 'number', 'boolean', 'json', 'image', 'url') DEFAULT 'text',
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_section_key (section, content_key),
  INDEX idx_section (section),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default content for hero section
INSERT IGNORE INTO sph_content (section, content_key, content_value, content_type, description) VALUES
('hero', 'title', 'Sekolah Properti Himperra', 'text', 'Judul Utama'),
('hero', 'subtitle', 'Membangun Masa Depan Properti Indonesia', 'text', 'Sub Judul'),
('hero', 'description', 'Belajar strategi investasi properti yang menguntungkan dengan mentor berpengalaman dan sistem pembelajaran yang terbukti efektif', 'textarea', 'Deskripsi'),
('hero', 'cta_text', 'Daftar Sekarang', 'text', 'Teks CTA Button'),
('hero', 'feature_1_text', '500+ Alumni Sukses', 'text', 'Feature Pill 1'),
('hero', 'feature_2_text', 'Mentor Expert', 'text', 'Feature Pill 2'),
('hero', 'feature_3_text', 'Materi Premium', 'text', 'Feature Pill 3'),
('hero', 'feature_4_text', 'Lifetime Support', 'text', 'Feature Pill 4');

-- Insert default content for about section  
INSERT IGNORE INTO sph_content (section, content_key, content_value, content_type, description) VALUES
('about', 'title', 'Tentang Sekolah Properti', 'text', 'Judul Section'),
('about', 'description', 'Properti merupakan salah satu instrumen investasi paling stabil dan menguntungkan. Melalui Sekolah Properti Himperra, kami memberikan edukasi komprehensif mulai dari dasar-dasar investasi properti hingga strategi advanced untuk mengoptimalkan ROI. Program ini dirancang khusus untuk memberikan pengetahuan praktis yang dapat langsung diaplikasikan.', 'textarea', 'Deskripsi About');

-- Insert default content for slider section
INSERT IGNORE INTO sph_content (section, content_key, content_value, content_type, description) VALUES
('slider', 'slide_1_title', 'Pembelajaran Interaktif', 'text', 'Slide 1 Judul'),
('slider', 'slide_1_subtitle', 'Metode modern & engaging', 'text', 'Slide 1 Subtitle'),
('slider', 'slide_1_description', 'Dapatkan insight eksklusif dari praktisi properti terbaik di Lampung dengan metode pembelajaran yang interaktif dan mudah dipahami', 'textarea', 'Slide 1 Deskripsi'),
('slider', 'slide_2_title', 'Strategi Investasi Terbukti', 'text', 'Slide 2 Judul'),
('slider', 'slide_2_subtitle', 'ROI tinggi dengan risiko terukur', 'text', 'Slide 2 Subtitle'),
('slider', 'slide_2_description', 'Pelajari strategi yang telah terbukti menghasilkan keuntungan konsisten di berbagai kondisi pasar properti', 'textarea', 'Slide 2 Deskripsi');

-- Insert default content for features section
INSERT IGNORE INTO sph_content (section, content_key, content_value, content_type, description) VALUES
('features', 'title', 'Keunggulan Program', 'text', 'Judul Features'),
('features', 'benefit_1_title', 'Strategi Investasi Terpilih', 'text', 'Feature 1 Judul'),
('features', 'benefit_1_description', 'Pelajari teknik-teknik investasi properti yang terbukti menguntungkan dari para ahli berpengalaman.', 'textarea', 'Feature 1 Deskripsi'),
('features', 'benefit_2_title', 'Analisis Pasar Mendalam', 'text', 'Feature 2 Judul'),
('features', 'benefit_2_description', 'Dapatkan wawasan tentang tren pasar properti Lampung dan cara mengidentifikasi peluang terbaik.', 'textarea', 'Feature 2 Deskripsi'),
('features', 'benefit_3_title', 'Simulasi Pembiayaan', 'text', 'Feature 3 Judul'),
('features', 'benefit_3_description', 'Pelajari skema pembiayaan KPR, perhitungan cash flow, dan strategi leverage yang optimal.', 'textarea', 'Feature 3 Deskripsi'),
('features', 'benefit_4_title', 'Study Kasus Nyata', 'text', 'Feature 4 Judul'),
('features', 'benefit_4_description', 'Analisis proyek-proyek properti sukses di Lampung dengan ROI tinggi dan risiko terukur.', 'textarea', 'Feature 4 Deskripsi');

-- Insert default content for registration section
INSERT IGNORE INTO sph_content (section, content_key, content_value, content_type, description) VALUES
('registration', 'title', 'Pendaftaran Sekolah Properti', 'text', 'Judul Pendaftaran'),
('registration', 'description', 'Daftar sekarang dan mulai perjalanan Anda di dunia properti dengan bimbingan mentor berpengalaman', 'textarea', 'Deskripsi Pendaftaran'),
('registration', 'fee_student', 'Rp 100.000', 'text', 'Biaya Mahasiswa'),
('registration', 'fee_general', 'Rp 150.000', 'text', 'Biaya Umum'),
('registration', 'deadline', '10 Desember 2025', 'text', 'Batas Pendaftaran'),
('registration', 'max_participants', '50', 'text', 'Kuota Maksimal');

-- Insert default content for countdown section
INSERT IGNORE INTO sph_content (section, content_key, content_value, content_type, description) VALUES
('countdown', 'title', 'Acara Dimulai Dalam:', 'text', 'Judul Countdown'),
('countdown', 'subtitle', 'Jangan sampai terlewat!', 'text', 'Subtitle Countdown'),
('countdown', 'target_date', '2025-12-15T08:00:00', 'text', 'Tanggal Target Countdown');