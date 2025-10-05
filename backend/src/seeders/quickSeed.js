require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createUsersDirectly() {
  console.log('🚀 Creating users directly...');
  
  let connection;
  try {
    // Koneksi ke MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'musda'
    });

    console.log('✅ Connected to database');

    // Cek dan buat tabel jika perlu
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

    // Data users
    const users = [
      {
        username: 'superadmin',
        password: await bcrypt.hash('superadmin123', 10),
        role: 'super_admin',
        nama: 'Super Administrator',
        email: 'superadmin@himperra.com',
        status: 'active'
      },
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        nama: 'Administrator',
        email: 'admin@himperra.com',
        status: 'active'
      },
      {
        username: 'panitia',
        password: await bcrypt.hash('panitia123', 10),
        role: 'moderator',
        nama: 'Panitia MUSDA',
        email: 'panitia@himperra.com',
        status: 'active'
      },
      {
        username: 'viewer',
        password: await bcrypt.hash('viewer123', 10),
        role: 'viewer',
        nama: 'Viewer',
        email: 'viewer@himperra.com',
        status: 'active'
      }
    ];

    console.log('🌱 Inserting users...');

    for (const user of users) {
      try {
        // Cek jika user sudah ada
        const [existing] = await connection.query(
          'SELECT id FROM users WHERE username = ?',
          [user.username]
        );

        if (existing.length > 0) {
          console.log(`⚠️  User ${user.username} sudah ada, skip...`);
          continue;
        }

        // Insert user
        const [result] = await connection.query(
          'INSERT INTO users (username, password, role, nama, email, status) VALUES (?, ?, ?, ?, ?, ?)',
          [user.username, user.password, user.role, user.nama, user.email, user.status]
        );

        console.log(`✅ User ${user.username} berhasil dibuat dengan ID: ${result.insertId}`);
      } catch (error) {
        console.error(`❌ Error creating user ${user.username}:`, error.message);
      }
    }

    // Tampilkan hasil
    const [allUsers] = await connection.query('SELECT id, username, role, nama, email, status FROM users');
    
    console.log('\n🎉 Seeding completed!');
    console.log('\n📋 Users in database:');
    console.log('┌────┬─────────────┬─────────────────┬─────────────────────┬─────────────────────────┬──────────┐');
    console.log('│ ID │ Username    │ Role            │ Nama                │ Email                   │ Status   │');
    console.log('├────┼─────────────┼─────────────────┼─────────────────────┼─────────────────────────┼──────────┤');
    
    allUsers.forEach(user => {
      console.log(`│ ${user.id.toString().padEnd(2)} │ ${user.username.padEnd(11)} │ ${user.role.padEnd(15)} │ ${(user.nama || '').padEnd(19)} │ ${(user.email || '').padEnd(23)} │ ${user.status.padEnd(8)} │`);
    });
    
    console.log('└────┴─────────────┴─────────────────┴─────────────────────┴─────────────────────────┴──────────┘');
    
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
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Jalankan
createUsersDirectly().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});