const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createParticipantsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'musda1'
  });

  try {
    const filePath = path.join(__dirname, 'migrations', 'create_sph_participants_table.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      await connection.execute(stmt);
    }
    console.log('✅ sph_participants table ensured.');
  } catch (err) {
    console.error('❌ Failed to create sph_participants table:', err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  createParticipantsTable();
}

module.exports = createParticipantsTable;
