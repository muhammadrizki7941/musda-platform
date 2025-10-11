require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  try {
    // Koneksi tanpa database specific untuk membuat database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server');

    // Buat database jika belum ada
    const dbName = process.env.DB_NAME || 'musda';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready`);

    // Gunakan database
    await connection.query(`USE \`${dbName}\``);

    // Buat tabel users jika belum ada
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin','admin','moderator','viewer','user') NOT NULL DEFAULT 'user',
        nama VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        status ENUM('active','inactive','suspended') DEFAULT 'active',
        twoFactorEnabled BOOLEAN DEFAULT FALSE,
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.query(createTableQuery);
    console.log('✅ Table users ready');

    // Cek apakah tabel benar-benar ada
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      throw new Error('Table users creation failed');
    }
    console.log('✅ Table users verified');

    // Buat index jika belum ada
    try {
      await connection.query('CREATE INDEX idx_users_username ON users(username)');
      console.log('✅ Index username created');
    } catch (e) {
      // Index mungkin sudah ada
      console.log('ℹ️  Index username already exists');
    }
    
    try {
      await connection.query('CREATE INDEX idx_users_email ON users(email)');
      console.log('✅ Index email created');
    } catch (e) {
      // Index mungkin sudah ada
      console.log('ℹ️  Index email already exists');
    }

    await connection.end();
    console.log('✅ Database setup completed');
    
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return false;
  }
}

// Jalankan jika dipanggil langsung
if (require.main === module) {
  setupDatabase().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = setupDatabase;