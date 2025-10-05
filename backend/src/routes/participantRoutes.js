const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const { sendTicketEmail } = require('../controllers/emailController');
const { db, dbPromise } = require('../utils/db');

// GET /api/participants - List all participants (from guests table)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/participants - Fetching all participants from guests table');
    
    const query = `
      SELECT id, nama, email, whatsapp, asal_instansi, kota, kategori, status_kehadiran, 
             qr_code, verification_token, is_verified, created_at, updated_at
      FROM guests 
      ORDER BY created_at DESC
    `;
    
    const [results] = await dbPromise.query(query);
    
    console.log(`Found ${results.length} participants`);
    res.json(results);
    
  } catch (error) {
    console.error('Error in participants list:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// GET /api/participants/present - List recently present attendees (hadir)
router.get('/present', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 200);
    console.log(`GET /api/participants/present - Fetching last ${limit} present attendees`);
    // 1) MUSDA guests marked hadir
    const [guestRows] = await dbPromise.query(
      `SELECT id, nama, asal_instansi, kota, updated_at
       FROM guests
       WHERE status_kehadiran = 'hadir'
       ORDER BY updated_at DESC
       LIMIT ?`,
      [limit]
    );

    // 2) SPH participants recently checked-in (we record check-ins in notes with [CHECK-IN])
    const [sphRows] = await dbPromise.query(
      `SELECT id, full_name AS nama, ${await (async()=>{
        // inline detect institution column similar to model (simple attempt)
        try {
          const [ok] = await dbPromise.query("SHOW COLUMNS FROM sph_participants LIKE 'institution'");
          return (ok && ok.length>0) ? 'institution' : 'instihtion';
        } catch { return 'institution'; }
      })()} AS asal_instansi, NULL AS kota, 
        COALESCE(payment_date, registration_date) AS updated_at
       FROM sph_participants
       WHERE notes LIKE '%[CHECK-IN]%'
       ORDER BY updated_at DESC
       LIMIT ?`,
      [limit]
    );

    // Merge and sort by updated_at desc, then cap to limit
    const merged = [...guestRows, ...sphRows]
      .sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit);

    res.json(merged);
  } catch (error) {
    console.error('Error fetching present attendees:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /api/participants/:id - Get participant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/participants/${id} - Fetching participant by ID`);
    
    const query = `
      SELECT id, nama, email, whatsapp, asal_instansi, kota, kategori, status_kehadiran, 
             qr_code, verification_token, is_verified, created_at, updated_at
      FROM guests 
      WHERE id = ?
    `;
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Database error in participant get:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Participant not found' });
      }
      
      return res.json(results[0]);
    });
    
  } catch (error) {
    console.error('Error in participant get:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// POST /api/participants - Create new participant with validation
router.post('/', async (req, res) => {
  try {
    const { nama, email, whatsapp, asal_instansi } = req.body;
    console.log('POST /api/participants - Creating new participant:', { nama, email });
    
    // Validation
    if (!nama || !email || !whatsapp) {
      return res.status(400).json({ error: 'Nama, email, dan whatsapp wajib diisi' });
    }

    // Email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid' });
    }

    // Check if email or whatsapp already exists
    const checkDuplicateQuery = `
      SELECT id, email, whatsapp FROM guests 
      WHERE email = ? OR whatsapp = ?
    `;
    
    db.query(checkDuplicateQuery, [email, whatsapp], async (err, existingResults) => {
      if (err) {
        console.error('Database error checking duplicates:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          details: err.message 
        });
      }
      
      if (existingResults.length > 0) {
        const existing = existingResults[0];
        if (existing.email === email) {
          return res.status(409).json({ 
            error: 'Email sudah terdaftar', 
            message: 'Email ini sudah terdaftar. Jika Anda ingin menerima ulang e-ticket, silakan klik "Kirim Ulang E-Ticket"',
            canResendTicket: true,
            participantId: existing.id
          });
        }
        if (existing.whatsapp === whatsapp) {
          return res.status(409).json({ 
            error: 'WhatsApp sudah terdaftar', 
            message: 'Nomor WhatsApp ini sudah terdaftar. Jika Anda ingin menerima ulang e-ticket, silakan klik "Kirim Ulang E-Ticket"',
            canResendTicket: true,
            participantId: existing.id
          });
        }
      }
      
      // Generate verification token and QR code
  const verificationToken = crypto.randomBytes(32).toString('hex');
  // QR payload stabil: "MUSDA|<verification_token>"
  const qrData = `MUSDA|${verificationToken}`;
      
      try {
        const qrCodeDataURL = await QRCode.toDataURL(qrData);
        
        const insertQuery = `
          INSERT INTO guests (nama, email, whatsapp, asal_instansi, status_kehadiran, 
                             verification_token, qr_code, is_verified)
          VALUES (?, ?, ?, ?, 'pending', ?, ?, 0)
        `;
        
        db.query(insertQuery, [nama, email, whatsapp, asal_instansi || '', verificationToken, qrData], (err, result) => {
          if (err) {
            console.error('Database error in participant create:', err);
            return res.status(500).json({ 
              error: 'Database error', 
              details: err.message 
            });
          }
          
          const newParticipant = {
            id: result.insertId,
            nama,
            email,
            whatsapp,
            asal_instansi: asal_instansi || '',
            status_kehadiran: 'pending',
            verification_token: verificationToken,
            qr_code: qrData,
            qr_code_image: qrCodeDataURL,
            is_verified: 0,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          console.log('Participant created successfully:', newParticipant.id);
          res.status(201).json(newParticipant);
        });
        
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        return res.status(500).json({ 
          error: 'Error generating QR code', 
          details: qrError.message 
        });
      }
    });
    
  } catch (error) {
    console.error('Error in participant create:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// POST /api/participants/:id/resend-ticket - Resend e-ticket
router.post('/:id/resend-ticket', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`POST /api/participants/${id}/resend-ticket - Resending e-ticket`);
    
    const query = `
      SELECT id, nama, email, whatsapp, qr_code, verification_token
      FROM guests 
      WHERE id = ?
    `;
    
    const [results] = await dbPromise.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    const participant = results[0];
    
    try {
      // Send real email using centralized email controller
      const result = await sendTicketEmail(participant.id, {
        id: participant.id,
        nama: participant.nama,
        email: participant.email,
        whatsapp: participant.whatsapp,
        instansi: participant.asal_instansi,
        booking_date: new Date().toISOString().slice(0, 10)
      });
      
      return res.json({
        message: 'E-ticket berhasil dikirim ulang',
        email: participant.email,
        meta: result
      });
    } catch (qrError) {
      console.error('Error sending e-ticket:', qrError);
      return res.status(500).json({ error: 'Gagal mengirim e-ticket', details: qrError.message });
    }
    
  } catch (error) {
    console.error('Error in resend ticket:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// POST /api/participants/scan-qr - Scan QR for attendance
router.post('/scan-qr', async (req, res) => {
  try {
    const { qrCode } = req.body;
    console.log('POST /api/participants/scan-qr - Scanning QR:', qrCode);
    
    if (!qrCode) {
      return res.status(400).json({ error: 'QR Code wajib diisi', reason: 'MISSING_QR' });
    }
    
    // 1) Coba validasi sebagai Guest/MUSDA ticket
    const guestQuery = `
      SELECT id, nama, email, whatsapp, asal_instansi, kota, kategori, status_kehadiran, 
             qr_code, verification_token, is_verified
      FROM guests 
      WHERE qr_code = ? OR verification_token = ?
    `;
    const [guestMatches] = await dbPromise.query(guestQuery, [qrCode, qrCode]);

    if (guestMatches.length > 0) {
      const participant = guestMatches[0];
      if (participant.status_kehadiran === 'hadir') {
        return res.status(409).json({ 
          error: 'Peserta sudah absen', 
          message: `${participant.nama} sudah melakukan absensi sebelumnya`,
          reason: 'ALREADY_PRESENT',
          participant 
        });
      }
      await dbPromise.query(
        `UPDATE guests SET status_kehadiran = 'hadir', updated_at = NOW() WHERE id = ?`,
        [participant.id]
      );
      console.log('Attendance updated successfully for guest:', participant.id);
      return res.json({ 
        message: 'Absensi berhasil (Guest)',
        participant: { ...participant, status_kehadiran: 'hadir' }
      });
    }

    // 2) Jika tidak ditemukan di Guests, coba validasi sebagai SPH ticket.
    // Bentuk QR stabil untuk SPH: "SPH|<payment_code>"
    if (typeof qrCode === 'string' && qrCode.startsWith('SPH|')) {
      const paymentCode = qrCode.split('|')[1];
      if (!paymentCode) {
        return res.status(404).json({ error: 'QR Code SPH tidak valid', reason: 'PAYMENT_CODE_MISSING' });
      }

      const [sphMatches] = await dbPromise.query(
        `SELECT id, full_name, email, phone, institution, payment_status, payment_code
         FROM sph_participants WHERE payment_code = ?`,
        [paymentCode]
      );

      if (sphMatches.length === 0) {
        return res.status(404).json({ error: 'QR Code tidak valid atau tidak ditemukan', reason: 'SPH_NOT_FOUND' });
      }

      const sph = sphMatches[0];
      if (sph.payment_status === 'pending') {
        return res.status(409).json({
          error: 'Pembayaran belum dikonfirmasi',
          message: `${sph.full_name} masih berstatus pending. Mohon selesaikan pembayaran terlebih dahulu.`,
          reason: 'SPH_PAYMENT_PENDING'
        });
      }
      if (sph.payment_status === 'cancelled') {
        return res.status(409).json({
          error: 'Pembayaran dibatalkan',
          message: `${sph.full_name} memiliki status pembayaran dibatalkan. Silakan hubungi panitia.`,
          reason: 'SPH_PAYMENT_CANCELLED'
        });
      }
      if (sph.payment_status !== 'paid') {
        return res.status(409).json({
          error: 'Pembayaran belum dikonfirmasi',
          message: `${sph.full_name} belum berstatus paid`,
          reason: 'SPH_NOT_PAID'
        });
      }

      // Catat check-in di notes (tidak ada kolom hadir khusus di SPH)
      const noteLine = `[CHECK-IN] ${new Date().toISOString()}`;
      await dbPromise.query(
        `UPDATE sph_participants SET notes = CONCAT(IFNULL(notes,''), '\n', ?) WHERE id = ?`,
        [noteLine, sph.id]
      );

      console.log('Attendance noted for SPH participant:', sph.id);
      // Kembalikan bentuk participant sintetis agar UI admin tetap bisa menampilkan
      return res.json({
        message: 'Absensi berhasil (SPH)',
        participant: {
          id: sph.id,
          nama: sph.full_name,
          email: sph.email,
          whatsapp: sph.phone,
          asal_instansi: sph.institution,
          status_kehadiran: 'hadir',
          qr_code: qrCode,
          verification_token: sph.payment_code,
          is_verified: 1
        }
      });
    }

    // 3) Gagal validasi di kedua jalur
  return res.status(404).json({ error: 'QR Code tidak valid atau tidak ditemukan', reason: 'NOT_FOUND' });
    
  } catch (error) {
    console.error('Error in QR scan:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// PUT /api/participants/:id - Update participant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, whatsapp, asal_instansi, status_kehadiran } = req.body;
    console.log(`PUT /api/participants/${id} - Updating participant`);

    const [exists] = await dbPromise.query('SELECT id FROM guests WHERE id = ?', [id]);
    if (!exists || exists.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    await dbPromise.query(
      `UPDATE guests 
       SET nama = ?, email = ?, whatsapp = ?, asal_instansi = ?, 
           status_kehadiran = ?, updated_at = NOW()
       WHERE id = ?`,
      [nama, email, whatsapp, asal_instansi, status_kehadiran, id]
    );

    console.log('Participant updated successfully:', id);
    res.json({ message: 'Participant updated successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error in participant update:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// DELETE /api/participants/:id - Delete participant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/participants/${id} - Deleting participant`);

    const [exists] = await dbPromise.query('SELECT id FROM guests WHERE id = ?', [id]);
    if (!exists || exists.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    await dbPromise.query('DELETE FROM guests WHERE id = ?', [id]);

    console.log('Participant deleted successfully:', id);
    res.json({ message: 'Participant deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error in participant delete:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

module.exports = router;