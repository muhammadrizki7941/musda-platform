const Guest = require('../models/guestModel');
const QRCode = require('qrcode');
const User = require('../models/User');

const guestController = {
  // Register guest
  register: async (req, res) => {
    const { nama, instansi, whatsapp, email, position, city, category, experience, expectations } = req.body;
    if (!nama || !email || !whatsapp) {
      return res.status(400).json({ error: 'Nama, email, dan WhatsApp wajib diisi' });
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid.' });
    }
    let hp = whatsapp.replace(/\D/g, '');
    if (hp.startsWith('0')) hp = '62' + hp.slice(1);
    if (!hp.startsWith('62')) hp = '62' + hp;
    if (hp.length < 10 || hp.length > 15) {
      return res.status(400).json({ error: 'Nomor HP tidak valid.' });
    }
    const formattedWhatsapp = '+' + hp;
    try {
      const guests = await Guest.list(null);
      const already = guests.find(g => g.email === email || g.whatsapp === formattedWhatsapp);
      if (already) {
        return res.status(409).json({ error: 'Anda sudah terdaftar. Jika kehilangan tiket, silakan klik tombol Kirim Ulang E-Tiket.' });
      }
      
      // Only use fields that exist in the table
      const guestData = {
        nama,
        email,
        whatsapp: formattedWhatsapp,
        instansi: instansi || 'Tidak disebutkan'
      };
      
      const result = await Guest.create(guestData);
      const id = result.insertId;
      QRCode.toDataURL(id.toString(), (err, qr) => {
        if (err) return res.status(500).json({ error: 'Gagal generate QR' });
        res.json({ id, qr });
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
