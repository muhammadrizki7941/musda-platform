const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    // Database connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'musda1'
    });

    console.log('Connected to database...');

    // Read and execute SPH participants table migration
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create_sph_participants_table.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }

    console.log('SPH participants table migration completed successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();