require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

class UserSeeder {
  static async run() {
    console.log('🌱 Seeding users...');
    
    let connection;
    try {
      // Buat koneksi langsung ke database
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'musda'
      });

      // Data user default yang akan di-seed
      const defaultUsers = [
        {
          username: 'superadmin',
          password: 'superadmin123',
          role: 'super_admin',
          nama: 'Super Administrator',
          email: 'superadmin@himperra.com',
          status: 'active'
        },
        {
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          nama: 'Administrator',
          email: 'admin@himperra.com',
          status: 'active'
        },
        {
          username: 'panitia',
          password: 'panitia123',
          role: 'moderator',
          nama: 'Panitia MUSDA',
          email: 'panitia@himperra.com',
          status: 'active'
        },
        {
          username: 'viewer',
          password: 'viewer123',
          role: 'viewer',
          nama: 'Viewer',
          email: 'viewer@himperra.com',
          status: 'active'
        }
      ];

      // Insert user baru
      for (const user of defaultUsers) {
        // Cek apakah user sudah ada
        const [existingUser] = await connection.query(
          'SELECT id FROM users WHERE username = ? OR email = ?', 
          [user.username, user.email]
        );

        if (existingUser.length > 0) {
          console.log(`⚠️  User ${user.username} sudah ada, skip...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insert user baru
        const [result] = await connection.query(
          `INSERT INTO users (username, password, role, nama, email, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            user.username,
            hashedPassword,
            user.role,
            user.nama,
            user.email,
            user.status
          ]
        );

        console.log(`✅ User ${user.username} berhasil dibuat dengan ID: ${result.insertId}`);
      }

      console.log('🎉 User seeding completed!');
      console.log('\n📋 Login credentials:');
      console.log('┌─────────────┬──────────────┬─────────────────┐');
      console.log('│ Username    │ Password     │ Role            │');
      console.log('├─────────────┼──────────────┼─────────────────┤');
      console.log('│ superadmin  │ superadmin123│ super_admin     │');
      console.log('│ admin       │ admin123     │ admin           │');
      console.log('│ panitia     │ panitia123   │ moderator       │');
      console.log('│ viewer      │ viewer123    │ viewer          │');
      console.log('└─────────────┴──────────────┴─────────────────┘');

    } catch (error) {
      console.error('❌ Error seeding users:', error.message);
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  // Method untuk clear semua users (gunakan dengan hati-hati!)
  static async clear() {
    console.log('🗑️  Clearing all users...');
    try {
      await db.query('DELETE FROM users');
      console.log('✅ All users cleared');
    } catch (error) {
      console.error('❌ Error clearing users:', error.message);
      throw error;
    }
  }

  // Method untuk reset auto increment
  static async resetAutoIncrement() {
    try {
      await db.query('ALTER TABLE users AUTO_INCREMENT = 1');
      console.log('✅ Auto increment reset');
    } catch (error) {
      console.error('❌ Error resetting auto increment:', error.message);
    }
  }
}

module.exports = UserSeeder;