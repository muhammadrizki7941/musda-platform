const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Hapus semua data existing
  await knex('users').del();

  // Hash passwords
  const hashedPasswords = {
    superadmin: await bcrypt.hash('superadmin123', 10),
    admin: await bcrypt.hash('admin123', 10),
    panitia: await bcrypt.hash('panitia123', 10),
    viewer: await bcrypt.hash('viewer123', 10)
  };

  // Insert seed entries
  await knex('users').insert([
    {
      username: 'superadmin',
      password: hashedPasswords.superadmin,
      role: 'super_admin',
      nama: 'Super Administrator',
      email: 'superadmin@himperra.com',
      status: 'active'
    },
    {
      username: 'admin',
      password: hashedPasswords.admin,
      role: 'admin',
      nama: 'Administrator',
      email: 'admin@himperra.com',
      status: 'active'
    },
    {
      username: 'panitia',
      password: hashedPasswords.panitia,
      role: 'moderator',
      nama: 'Panitia MUSDA',
      email: 'panitia@himperra.com',
      status: 'active'
    },
    {
      username: 'viewer',
      password: hashedPasswords.viewer,
      role: 'viewer',
      nama: 'Viewer',
      email: 'viewer@himperra.com',
      status: 'active'
    }
  ]);

  console.log('✅ Users seeded successfully!');
  console.log('🔑 Login credentials:');
  console.log('- superadmin / superadmin123 (super_admin)');
  console.log('- admin / admin123 (admin)');
  console.log('- panitia / panitia123 (moderator)');
  console.log('- viewer / viewer123 (viewer)');
};