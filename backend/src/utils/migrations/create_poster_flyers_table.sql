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