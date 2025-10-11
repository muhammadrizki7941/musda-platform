-- Migration: create news feature tables
CREATE TABLE IF NOT EXISTS news_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  excerpt TEXT,
  content_html LONGTEXT,
  content_text LONGTEXT,
  thumbnail_path VARCHAR(255),
  seo_title VARCHAR(180),
  seo_description VARCHAR(255),
  seo_keywords VARCHAR(255),
  canonical_url VARCHAR(255),
  is_published TINYINT(1) DEFAULT 0,
  published_at DATETIME NULL,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_by INT NULL,
  updated_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_news_published (is_published, published_at),
  INDEX idx_news_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  user_email VARCHAR(180) NULL,
  content TEXT NOT NULL,
  is_approved TINYINT(1) DEFAULT 0,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  INDEX idx_comments_article (article_id),
  INDEX idx_comments_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS news_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  client_fingerprint VARCHAR(64) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_news_like (article_id, client_fingerprint),
  FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  INDEX idx_likes_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
