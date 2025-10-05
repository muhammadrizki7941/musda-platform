const mysql = require('mysql2');

// Buat pool koneksi
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'musda1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export callback style dan promise style
const db = pool; // For callback style
const dbPromise = pool.promise(); // For promise style

// Tes koneksi database
pool.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connection successful');
  }
});

module.exports = { db, dbPromise };
