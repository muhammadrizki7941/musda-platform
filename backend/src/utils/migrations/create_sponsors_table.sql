CREATE TABLE IF NOT EXISTS sponsors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(255) NOT NULL,
  category ENUM('emerald','platinum','gold','silver','bronze','harmony') NOT NULL
);
