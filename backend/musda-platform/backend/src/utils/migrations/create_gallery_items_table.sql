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