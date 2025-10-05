const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateSPHParticipants() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'musda1'
  });

  console.log('🚀 Starting SPH participants migration...');

  try {
    // 1. Cek data di tabel participants yang termasuk SPH (kategori = SMP Unia)
    const [participantsData] = await connection.execute(`
      SELECT * FROM participants 
      WHERE kategori LIKE '%SMP%' OR kategori LIKE '%Unia%' OR asal_instansi LIKE '%SMP%'
      ORDER BY created_at
    `);

    console.log(`📋 Found ${participantsData.length} SPH participants to migrate`);

    if (participantsData.length === 0) {
      console.log('ℹ️  No SPH participants found to migrate');
      return;
    }

    // 2. Tampilkan data yang akan dipindah
    console.log('\n📊 Data yang akan dipindah:');
    participantsData.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.name} (${participant.email}) - ${participant.kategori}`);
    });

    // 3. Migrasi data ke tabel sph_participants
    for (const participant of participantsData) {
      // Map data dari participants ke sph_participants
      const sphData = {
        full_name: participant.name,
        email: participant.email,
        phone: participant.whatsapp || '',
        institution: participant.asal_instansi || '',
        experience_level: 'pemula', // default
        payment_status: participant.paymentStatus === 'paid' ? 'paid' : 'pending',
        payment_method: participant.paymentMethod || 'manual',
        payment_code: participant.paymentCode || '',
        registration_date: participant.created_at,
        payment_date: participant.updated_at,
        qr_code_path: participant.ticketUrl || '',
        notes: `Migrated from participants table. Original ID: ${participant.id}, Amount: ${participant.amount}`
      };

      try {
        await connection.execute(`
          INSERT INTO sph_participants (
            full_name, email, phone, institution, experience_level,
            payment_status, payment_method, payment_code, registration_date,
            payment_date, qr_code_path, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sphData.full_name,
          sphData.email,
          sphData.phone,
          sphData.institution,
          sphData.experience_level,
          sphData.payment_status,
          sphData.payment_method,
          sphData.payment_code,
          sphData.registration_date,
          sphData.payment_date,
          sphData.qr_code_path,
          sphData.notes
        ]);

        console.log(`✅ Migrated: ${sphData.full_name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Skipped duplicate: ${sphData.full_name} (${sphData.email})`);
        } else {
          console.error(`❌ Error migrating ${sphData.full_name}:`, error.message);
        }
      }
    }

    // 4. Update participant count di sph_settings
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM sph_participants WHERE payment_status = "paid"');
    const paidCount = countResult[0].count;

    await connection.execute('UPDATE sph_settings SET current_participants = ? WHERE id = 1', [paidCount]);
    console.log(`📊 Updated sph_settings current_participants to: ${paidCount}`);

    // 5. Hapus data SPH dari tabel participants
    const [deleteResult] = await connection.execute(`
      DELETE FROM participants 
      WHERE kategori LIKE '%SMP%' OR kategori LIKE '%Unia%' OR asal_instansi LIKE '%SMP%'
    `);
    console.log(`🗑️  Deleted ${deleteResult.affectedRows} SPH records from participants table`);

    console.log('\n🎉 SPH participants migration completed successfully!');

    // 6. Summary
    const [sphCount] = await connection.execute('SELECT COUNT(*) as count FROM sph_participants');
    const [remainingParticipants] = await connection.execute('SELECT COUNT(*) as count FROM participants');
    
    console.log('\n📈 Migration Summary:');
    console.log(`📋 SPH participants: ${sphCount[0].count}`);
    console.log(`📋 Remaining participants: ${remainingParticipants[0].count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await connection.end();
  }
}

// Run migration
migrateSPHParticipants();