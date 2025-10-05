/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Hapus semua data existing
  await knex('sponsors').del();

  // Insert seed entries
  await knex('sponsors').insert([
    {
      nama: 'Bank Lampung',
      description: 'Partner utama dalam mendukung kegiatan MUSDA II HIMPERRA',
      logo_url: '/uploads/sponsor-logos/bank-lampung.png',
      website_url: 'https://banklampung.co.id',
      contact_email: 'info@banklampung.co.id',
      contact_phone: '0721-123456',
      category: 'platinum',
      display_order: 1,
      status: 'active'
    },
    {
      nama: 'PT Sinar Mas',
      description: 'Gold sponsor yang mendukung program pengembangan SDM',
      logo_url: '/uploads/sponsor-logos/sinar-mas.png',
      website_url: 'https://sinarmas.com',
      contact_email: 'partnership@sinarmas.com',
      contact_phone: '0721-789012',
      category: 'gold',
      display_order: 2,
      status: 'active'
    },
    {
      nama: 'Universitas Lampung',
      description: 'Institusi pendidikan partner dalam pengembangan ilmu pengetahuan',
      logo_url: '/uploads/sponsor-logos/unila.png',
      website_url: 'https://unila.ac.id',
      contact_email: 'humas@unila.ac.id',
      contact_phone: '0721-345678',
      category: 'silver',
      display_order: 3,
      status: 'active'
    },
    {
      nama: 'Radio Lampung FM',
      description: 'Media partner dalam penyebaran informasi kegiatan',
      logo_url: '/uploads/sponsor-logos/radio-lampung.png',
      website_url: 'https://radiolampung.com',
      contact_email: 'redaksi@radiolampung.com',
      contact_phone: '0721-567890',
      category: 'media_partner',
      display_order: 4,
      status: 'active'
    }
  ]);

  console.log('✅ Sponsors seeded successfully!');
};