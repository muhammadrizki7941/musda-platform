require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createUsersManually() {
  console.log('👤 Creating users manually...');
  
  let connection;
  try {
    // Koneksi tanpa database untuk membuat database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server');

    // Buat database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS musda`);
    console.log('✅ Database musda ready');

    // Gunakan database
    await connection.query(`USE musda`);
    console.log('✅ Database selected');

    // Drop table lama jika ada
    await connection.query(`DROP TABLE IF EXISTS users`);
    console.log('🗑️  Old users table dropped');

    // Buat table baru
    const createTableSQL = `
      CREATE TABLE users (
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
    
    await connection.query(createTableSQL);
    console.log('✅ Table users created');

    // Data users dengan password yang sudah di-hash
    const users = [
      {
        username: 'superadmin',
        password: '$2b$10$lZVfQ1FYCGjDpdj/4s.hE.Pjkxe0F94Ha8oLxnvp1933zspyrKMR2', // superadmin123
        role: 'super_admin',
        nama: 'Super Administrator',
        email: 'superadmin@himperra.com',
        status: 'active'
      },
      {
        username: 'admin',
        password: '$2b$10$5n6CXnP2KnW5zAtfBWOmRO3tA8w0JuGgmGtrqL.d34FIa8MjJ34La', // admin123
        role: 'admin',
        nama: 'Administrator',
        email: 'admin@himperra.com',
        status: 'active'
      },
      {
        username: 'panitia',
        password: '$2b$10$usz8wgVoR67PtLd1zouC2eBbFeerrF9ogukeK.2S9lkrG9/qGpI3y', // panitia123
        role: 'moderator',
        nama: 'Panitia MUSDA',
        email: 'panitia@himperra.com',
        status: 'active'
      },
      {
        username: 'viewer',
        password: '$2b$10$L.hX0nUs94KurXtSm6QPDOxizzTKrAY0iShZ.jllYEv6w414aM8jy', // viewer123
        role: 'viewer',
        nama: 'Viewer',
        email: 'viewer@himperra.com',
        status: 'active'
      }
    ];

    console.log('🌱 Inserting users...');

    // Insert users
    for (const user of users) {
      const [result] = await connection.query(
        'INSERT INTO users (username, password, role, nama, email, status) VALUES (?, ?, ?, ?, ?, ?)',
        [user.username, user.password, user.role, user.nama, user.email, user.status]
      );
      console.log(`✅ User ${user.username} created with ID: ${result.insertId}`);
    }

    // Buat index untuk optimasi
    try {
      await connection.query('CREATE INDEX idx_users_username ON users(username)');
      await connection.query('CREATE INDEX idx_users_email ON users(email)');
      await connection.query('CREATE INDEX idx_users_role ON users(role)');
      await connection.query('CREATE INDEX idx_users_status ON users(status)');
      console.log('✅ Indexes created');
    } catch (error) {
      console.log('ℹ️  Indexes may already exist');
    }

    // Tampilkan hasil
    const [allUsers] = await connection.query('SELECT id, username, role, nama, email, status FROM users');
    
    console.log('\n🎉 Users created successfully!');
    console.log('\n📋 Users in database:');
    console.table(allUsers);
    
    console.log('\n🔑 Login credentials:');
    console.log('┌─────────────┬──────────────┬─────────────────┐');
    console.log('│ Username    │ Password     │ Role            │');
    console.log('├─────────────┼──────────────┼─────────────────┤');
    console.log('│ superadmin  │ superadmin123│ super_admin     │');
    console.log('│ admin       │ admin123     │ admin           │');
    console.log('│ panitia     │ panitia123   │ moderator       │');
    console.log('│ viewer      │ viewer123    │ viewer          │');
    console.log('└─────────────┴──────────────┴─────────────────┘');

    console.log('\n✨ Seeding completed! You can now login to the admin dashboard.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createUsersManually();