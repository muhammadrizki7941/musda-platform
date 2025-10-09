-- 02_create_sponsors_table.sql
CREATE TABLE IF NOT EXISTS sponsors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(255) NOT NULL,
  category ENUM('emerald','platinum','gold','silver','bronze','harmony') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sponsors_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;