/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Hapus semua data existing
  await knex('agendas').del();

  // Insert seed entries
  await knex('agendas').insert([
    {
      title: 'Pembukaan MUSDA II',
      description: 'Acara pembukaan resmi Musyawarah Daerah II HIMPERRA Provinsi Lampung',
      start_time: '2025-12-31 09:00:00',
      end_time: '2025-12-31 10:00:00',
      location: 'Auditorium Utama',
      speaker: 'Ketua HIMPERRA Pusat',
      type: 'presentation',
      status: 'scheduled',
      max_participants: 500
    },
    {
      title: 'Keynote Speech',
      description: 'Presentasi utama mengenai visi dan misi HIMPERRA ke depan',
      start_time: '2025-12-31 10:30:00',
      end_time: '2025-12-31 12:00:00',
      location: 'Auditorium Utama',
      speaker: 'Prof. Dr. Ahmad Reza',
      type: 'presentation',
      status: 'scheduled',
      max_participants: 500
    },
    {
      title: 'Coffee Break',
      description: 'Istirahat dan networking session',
      start_time: '2025-12-31 12:00:00',
      end_time: '2025-12-31 13:00:00',
      location: 'Lobby',
      type: 'break',
      status: 'scheduled'
    },
    {
      title: 'Workshop Kepemimpinan',
      description: 'Workshop interaktif tentang kepemimpinan organisasi',
      start_time: '2025-12-31 13:00:00',
      end_time: '2025-12-31 15:00:00',
      location: 'Ruang Workshop A',
      speaker: 'Dr. Siti Nurhaliza',
      type: 'workshop',
      status: 'scheduled',
      max_participants: 50
    },
    {
      title: 'Penutupan',
      description: 'Acara penutupan dan foto bersama',
      start_time: '2025-12-31 15:30:00',
      end_time: '2025-12-31 16:30:00',
      location: 'Auditorium Utama',
      type: 'presentation',
      status: 'scheduled',
      max_participants: 500
    }
  ]);

  console.log('✅ Agendas seeded successfully!');
};