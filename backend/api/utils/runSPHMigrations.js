const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSPHMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'musda1'
  });

  console.log('🚀 Starting SPH migrations...');

  try {
    // Read and execute migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = [
      'create_sph_settings_table.sql',
      'create_sph_content_table.sql', 
      'create_sph_participants_table.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Running migration: ${file}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            await connection.execute(statement);
          }
        }
        
        console.log(`✅ Migration completed: ${file}`);
      } else {
        console.log(`⚠️  Migration file not found: ${file}`);
      }
    }

    console.log('🎉 All SPH migrations completed successfully!');

    // Test the tables
    console.log('\n📊 Checking created tables...');
    
    const [settingsResult] = await connection.execute('SELECT COUNT(*) as count FROM sph_settings');
    console.log(`📋 sph_settings table: ${settingsResult[0].count} records`);
    
    const [contentResult] = await connection.execute('SELECT COUNT(*) as count FROM sph_content');
    console.log(`📋 sph_content table: ${contentResult[0].count} records`);
    
    const [participantsResult] = await connection.execute('SELECT COUNT(*) as count FROM sph_participants');
    console.log(`📋 sph_participants table: ${participantsResult[0].count} records`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await connection.end();
  }
}

// Run migrations
runSPHMigrations();