const express = require('express');
const router = express.Router();
const { panitiaOrAdminMiddleware, authMiddleware } = require('../middleware/authMiddleware');

// Contoh: admin/panitia bisa akses
router.get('/peserta', authMiddleware, panitiaOrAdminMiddleware, (req, res) => {
  res.json({ message: 'Menu peserta untuk panitia/admin', user: req.user });
});

router.get('/qrscanner', authMiddleware, panitiaOrAdminMiddleware, (req, res) => {
  res.json({ message: 'QR scanner untuk panitia/admin', user: req.user });
});

module.exports = router;
