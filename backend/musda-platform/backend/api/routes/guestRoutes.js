const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const emailController = require('../controllers/emailController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Pendaftaran tamu
router.post('/register', guestController.register);
router.post('/guests', guestController.register);

// Ambil tiket tamu (biarkan handler lama, belum refactor)
const Guest = require('../models/guestModel');
const QRCode = require('qrcode');
router.get('/ticket/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const guest = await Guest.findById(id);
    if (!guest) return res.status(404).json({ error: 'Tamu tidak ditemukan' });
    QRCode.toDataURL(id.toString(), (err, qr) => {
      if (err) return res.status(500).json({ error: 'Gagal generate QR' });
      res.json({ guest, qr });
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data tamu' });
  }
});

// Scan QR & update status hadir
router.post('/scan', authMiddleware, adminMiddleware, guestController.updateStatus);

// List tamu
router.get('/guests', guestController.list);

// Edit tamu
router.put('/guest/:id', authMiddleware, adminMiddleware, guestController.update);

// Delete tamu
router.delete('/guest/:id', authMiddleware, adminMiddleware, guestController.delete);

// Kirim ulang e-tiket
router.post('/send-ticket/:id', emailController.sendTicket);

// Endpoint validasi QR (biarkan handler lama, belum refactor)
router.get('/validate-qr', (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'ID tamu diperlukan' });
  Guest.findById(id, (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ valid: false, error: 'Tamu tidak ditemukan' });
    }
    const guest = results[0];
    // Update status hadir jika belum hadir
    if (guest.status_hadir === 0) {
      Guest.updateStatus(id, (err2) => {
        if (err2) {
          return res.status(500).json({ valid: true, guest, error: 'Gagal update status hadir' });
        }
        guest.status_hadir = 1;
        res.json({ valid: true, guest });
      });
    } else {
      res.json({ valid: true, guest });
    }
  });
});

module.exports = router;
