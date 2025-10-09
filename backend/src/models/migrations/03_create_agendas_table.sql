-- 03_create_agendas_table.sql
CREATE TABLE IF NOT EXISTS agendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIME NULL,
  end_time TIME NULL,
  agenda_date DATE NULL,
  location VARCHAR(255),
  speaker VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_agenda_date (agenda_date, start_time),
  INDEX idx_agenda_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;