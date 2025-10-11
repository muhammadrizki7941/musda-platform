const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Local database connection
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'musda1'
};

// Railway database connection
const railwayConfig = {
  host: 'gshinkansen.proxy.rlwy.net',
  port: 50232,
  user: 'root',
  password: '********', // Password akan diminta saat running
  database: 'railway'
};

async function migrateData() {
  let localConnection, railwayConnection;
  
  try {
    console.log('🔄 Connecting to local database...');
    localConnection = await mysql.createConnection(localConfig);
    
    console.log('🔄 Connecting to Railway database...');
    railwayConnection = await mysql.createConnection(railwayConfig);
    
    console.log('✅ Connected to both databases!');
    
    // 1. Create tables di Railway
    console.log('🔄 Creating tables in Railway...');
    
    // Read and execute migration files
    const migrationFiles = [
      'backend/src/models/migrations/create_admins_table.sql',
      'backend/src/utils/migrations/create_sponsors_table.sql'
    ];
    
    for (const file of migrationFiles) {
      if (fs.existsSync(file)) {
        const sql = fs.readFileSync(file, 'utf8');
        console.log(`📄 Executing ${file}...`);
        await railwayConnection.execute(sql);
      }
    }
    
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
    
    // 2. Migrate data dari local ke Railway
    console.log('🔄 Migrating data...');
    
    // Get tables to migrate
    const tables = ['admins', 'sponsors', 'agendas', 'gallery_items', 'poster_flyers'];
    
    for (const table of tables) {
      try {
        // Check if table exists in local
        const [rows] = await localConnection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length === 0) {
          console.log(`⚠️  Table ${table} not found in local database, skipping...`);
          continue;
        }
        
        // Get data from local
        const [data] = await localConnection.execute(`SELECT * FROM ${table}`);
        
        if (data.length === 0) {
          console.log(`📋 Table ${table}: No data to migrate`);
          continue;
        }
        
        console.log(`📋 Table ${table}: Found ${data.length} records`);
        
        // Get column names
        const [columns] = await localConnection.execute(`SHOW COLUMNS FROM ${table}`);
        const columnNames = columns.map(col => col.Field);
        
        // Prepare insert statement
        const placeholders = columnNames.map(() => '?').join(', ');
        const insertSQL = `INSERT INTO ${table} (${columnNames.join(', ')}) VALUES (${placeholders})`;
        
        // Insert data
        for (const row of data) {
          const values = columnNames.map(col => row[col]);
          await railwayConnection.execute(insertSQL, values);
        }
        
        console.log(`✅ Table ${table}: Migrated ${data.length} records`);
      } catch (error) {
        console.log(`❌ Error migrating table ${table}:`, error.message);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (localConnection) await localConnection.end();
    if (railwayConnection) await railwayConnection.end();
  }
}

// Run migration
migrateData();