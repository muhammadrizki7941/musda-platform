require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;

async function runSQLScript() {
  console.log('🗄️  Running SQL script...');
  
  let connection;
  try {
    // Baca file SQL
    const sqlContent = await fs.readFile('./src/seeders/users_seed.sql', 'utf8');
    
    // Pisahkan statement SQL (split by semicolon but handle multiline)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');

    // Koneksi ke database langsung
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'musda',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    // Jalankan setiap statement
    for (const statement of statements) {
      try {
        if (statement.includes('USE')) {
          await connection.query(statement);
          console.log('✅ Database selected');
        } else if (statement.includes('DROP TABLE')) {
          await connection.query(statement);
          console.log('🗑️  Old table dropped');
        } else if (statement.includes('CREATE TABLE')) {
          await connection.query(statement);
          console.log('✅ Table users created');
        } else if (statement.includes('INSERT INTO')) {
          const [result] = await connection.query(statement);
          console.log(`✅ Inserted ${result.affectedRows} users`);
        } else if (statement.includes('CREATE INDEX')) {
          await connection.query(statement);
          console.log('✅ Index created');
        } else if (statement.includes('SELECT')) {
          const [rows] = await connection.query(statement);
          if (Array.isArray(rows) && rows.length > 0) {
            console.log('\n📋 Users in database:');
            console.table(rows);
          }
        }
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('ℹ️  Resource already exists, skipping...');
        } else {
          console.error('❌ Error executing statement:', error.message);
        }
      }
    }

    console.log('\n🎉 SQL script executed successfully!');
    console.log('\n🔑 Login credentials:');
    console.log('┌─────────────┬──────────────┬─────────────────┐');
    console.log('│ Username    │ Password     │ Role            │');
    console.log('├─────────────┼──────────────┼─────────────────┤');
    console.log('│ superadmin  │ superadmin123│ super_admin     │');
    console.log('│ admin       │ admin123     │ admin           │');
    console.log('│ panitia     │ panitia123   │ moderator       │');
    console.log('│ viewer      │ viewer123    │ viewer          │');
    console.log('└─────────────┴──────────────┴─────────────────┘');

  } catch (error) {
    console.error('❌ Error running SQL script:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSQLScript();