const mysql = require('mysql2');

// Buat pool koneksi
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'musda1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// Tes koneksi database (hanya untuk production)
if (process.env.NODE_ENV === 'production') {
  db.query('SELECT 1')
    .then(() => console.log('Koneksi database berhasil'))
    .catch((err) => {
      console.error('Koneksi database gagal:', err);
    });
}

module.exports = db;
