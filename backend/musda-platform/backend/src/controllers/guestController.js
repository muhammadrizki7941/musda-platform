const Guest = require('../models/guestModel');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { dbPromise } = require('../utils/db');

const guestController = {
  // Register guest
  register: async (req, res) => {
    const { nama, instansi, whatsapp, email, kota, kategori } = req.body;
    if (!nama || !email || !whatsapp) {
      return res.status(400).json({ error: 'Nama, email, dan WhatsApp wajib diisi' });
    }
    
    // Validasi email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid.' });
    }
    
    // Format nomor WhatsApp
    let hp = whatsapp.replace(/\D/g, '');
    if (hp.startsWith('0')) hp = '62' + hp.slice(1);
    if (!hp.startsWith('62')) hp = '62' + hp;
    if (hp.length < 10 || hp.length > 15) {
      return res.status(400).json({ error: 'Nomor HP tidak valid.' });
    }
    const formattedWhatsapp = '+' + hp;
    
    try {
      // Cek duplikasi email dan WhatsApp
      const [existingGuests] = await dbPromise.query(
        'SELECT id FROM guests WHERE email = ? OR whatsapp = ?', 
        [email, formattedWhatsapp]
      );
      
      if (existingGuests.length > 0) {
        return res.status(409).json({ 
          error: 'Email atau WhatsApp sudah terdaftar. Jika kehilangan tiket, silakan hubungi panitia.',
          participantId: existingGuests[0].id 
        });
      }
      
  // Generate verification token dan QR code (stabil)
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const qrCodeText = `MUSDA|${verificationToken}`;
      
      // Insert guest ke database
      const guestData = {
        nama,
        email,
        whatsapp: formattedWhatsapp,
        instansi: instansi || 'Tidak disebutkan'
      };
      
      // Try to insert with kota & kategori if columns exist; fallback without them
      let insertSql = `INSERT INTO guests (nama, email, whatsapp, asal_instansi, status_kehadiran, qr_code, verification_token, is_verified) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      let params = [
        guestData.nama,
        guestData.email,
        guestData.whatsapp,
        guestData.instansi,
        'pending',
        qrCodeText,
        verificationToken,
        false
      ];
      if (typeof kota === 'string' || typeof kategori === 'string') {
        try {
          await dbPromise.query('SELECT kota, kategori FROM guests LIMIT 1');
          insertSql = `INSERT INTO guests (nama, email, whatsapp, asal_instansi, kota, kategori, status_kehadiran, qr_code, verification_token, is_verified)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          params = [
            guestData.nama,
            guestData.email,
            guestData.whatsapp,
            guestData.instansi,
            kota || null,
            kategori || null,
            'pending',
            qrCodeText,
            verificationToken,
            false
          ];
        } catch { /* columns not present, continue with base insert */ }
      }

      const [result] = await dbPromise.query(insertSql, params);
      
      const guestId = result.insertId;

      // Fetch full row to get created_at and persisted fields
      let guestRow = null;
      try {
        const [rows] = await dbPromise.query('SELECT * FROM guests WHERE id = ?', [guestId]);
        guestRow = rows && rows[0] ? rows[0] : null;
      } catch {}

      // Generate QR code image (simple inline for UI preview)
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeText);
      
      // Send email with e-ticket after successful registration
      try {
        // Import email function
        const { sendTicketEmail } = require('./emailController');
        
        // Send email (non-blocking)
        sendTicketEmail(guestId, guestData)
          .then(() => {
            console.log(`📧 E-Tiket berhasil dikirim ke ${guestData.email}`);
          })
          .catch((emailErr) => {
            console.error(`❌ Gagal kirim email ke ${guestData.email}:`, emailErr.message);
          });
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Don't fail registration if email fails
      }
      
      res.json({ 
        id: guestId,
        qr: qrCodeDataURL,
        message: 'Registrasi berhasil! E-ticket telah dikirim ke email Anda.',
        guest: {
          id: guestId,
          nama: guestRow?.nama || guestData.nama,
          email: guestRow?.email || guestData.email,
          whatsapp: guestRow?.whatsapp || guestData.whatsapp,
          asal_instansi: guestRow?.asal_instansi || guestData.instansi,
          instansi: guestRow?.asal_instansi || guestData.instansi, // alias for frontend compatibility
          kota: guestRow?.kota ?? (kota || null),
          kategori: guestRow?.kategori ?? (kategori || null),
          created_at: guestRow?.created_at || new Date(),
          verification_token: guestRow?.verification_token || verificationToken
        }
      });
      
    } catch (err) {
      console.error('Guest registration error:', err);
      res.status(500).json({ error: 'Gagal simpan data' });
    }
  },

  // List guests
  list: async (req, res) => {
    try {
      const guests = await Guest.list(req.query.filter || null);
      res.json(guests);
    } catch (err) {
      res.status(500).json({ error: 'Gagal ambil data tamu' });
    }
  },

  // Update guest
  update: async (req, res) => {
    const { id } = req.params;
    try {
      await Guest.update(id, req.body);
      res.json({ message: 'Data tamu berhasil diupdate' });
    } catch (err) {
      res.status(500).json({ error: 'Gagal update data tamu' });
    }
  },

  // Delete guest
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      await Guest.delete(id);
      res.json({ message: 'Data tamu berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ error: 'Gagal hapus data tamu' });
    }
  },

  // Update status hadir
  updateStatus: async (req, res) => {
    const { id } = req.params;
    try {
      await Guest.updateStatus(id);
      res.json({ message: 'Status hadir berhasil diupdate' });
    } catch (err) {
      res.status(500).json({ error: 'Gagal update status hadir' });
    }
  }
};

module.exports = guestController;
