const path = require('path');
const fs = require('fs');
// Abstraksi upload: mencoba multer, fallback busboy jika multer tidak tersedia
const upload = require('../utils/uploadAdapter');

exports.uploadLogo = [
  upload,
  (req, res) => {
    if (!req.file) {
      console.error('UPLOAD ERROR: No file uploaded (adapter)');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('UPLOAD SUCCESS:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path
    });
    const url = `/uploads/sponsor-logos/${req.file.filename}`;
    console.log('UPLOAD RESPONSE URL:', url);
    res.json({ url });
  }
];
