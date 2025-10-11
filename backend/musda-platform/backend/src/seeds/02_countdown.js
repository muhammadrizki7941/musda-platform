/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Hapus semua data existing
  await knex('countdown').del();

  // Insert seed entries
  await knex('countdown').insert([
    {
      event_name: 'MUSDA II HIMPERRA Lampung',
      target_date: '2025-12-31 09:00:00',
      description: 'Musyawarah Daerah II HIMPERRA Provinsi Lampung',
      status: 'active'
    }
  ]);

  console.log('✅ Countdown seeded successfully!');
};