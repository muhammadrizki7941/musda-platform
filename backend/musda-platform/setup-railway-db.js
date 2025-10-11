const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');

// Untuk input password secara aman
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askPassword() {
  return new Promise((resolve) => {
    rl.question('Masukkan password Railway MySQL: ', (password) => {
      resolve(password);
    });
  });
}

// Local database connection
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'musda1'
};

async function migrateData() {
  let localConnection, railwayConnection;
  
  try {
    
    // Railway database connection dengan password yang benar
    const railwayConfig = {
      host: 'shinkansen.proxy.rlwy.net',
      port: 50232,
      user: 'root',
      password: 'LagVYzdUYBwGVQEarPCNDojPhBhJNRIa',
      database: 'railway'
    };
    
    console.log('🔄 Connecting to local database...');
    localConnection = await mysql.createConnection(localConfig);
    
    console.log('🔄 Connecting to Railway database...');
    railwayConnection = await mysql.createConnection(railwayConfig);
    
    console.log('✅ Connected to both databases!');
    
    // 1. Create tables di Railway
    console.log('🔄 Creating tables in Railway...');
    
    // Create agendas table
    const createAgendasTable = `
      CREATE TABLE IF NOT EXISTS agendas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        agenda_date DATE NOT NULL,
        location VARCHAR(255),
        speaker VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await railwayConnection.execute(createAgendasTable);
    console.log('✅ Agendas table created');
    
    // Create gallery_items table
    const createGalleryTable = `
      CREATE TABLE IF NOT EXISTS gallery_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(500) NOT NULL,
        description TEXT,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await railwayConnection.execute(createGalleryTable);
    console.log('✅ Gallery table created');
    
    // Create poster_flyers table
    const createPosterTable = `
      CREATE TABLE IF NOT EXISTS poster_flyers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(500) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await railwayConnection.execute(createPosterTable);
    console.log('✅ Poster table created');
    
    // Create admins table (jika ada file migration)
    try {
      if (fs.existsSync('backend/src/models/migrations/create_admins_table.sql')) {
        const adminTableSQL = fs.readFileSync('backend/src/models/migrations/create_admins_table.sql', 'utf8');
        await railwayConnection.execute(adminTableSQL);
        console.log('✅ Admins table created from migration file');
      }
    } catch (error) {
      console.log('⚠️  Admin table migration skipped:', error.message);
    }
    
    // 2. Test connection dengan simple query
    const [result] = await railwayConnection.execute('SELECT 1 as test');
    console.log('✅ Railway database connection test passed');
    
    // 3. List existing tables
    const [tables] = await railwayConnection.execute('SHOW TABLES');
    console.log('📋 Tables in Railway database:', tables.map(t => Object.values(t)[0]));
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Update .env.production dengan password yang benar');
    console.log('   2. Deploy backend ke Vercel');
    console.log('   3. Test koneksi dari backend production');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Check password Railway MySQL kamu');
    }
  } finally {
    if (localConnection) await localConnection.end();
    if (railwayConnection) await railwayConnection.end();
  }
}

// Run setup
migrateData();