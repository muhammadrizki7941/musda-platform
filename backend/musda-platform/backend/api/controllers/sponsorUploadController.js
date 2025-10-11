const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');

const uploadDir = path.join(__dirname, '../../../uploads/sponsor-logos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

exports.uploadLogo = [
  upload.single('logo'),
  (req, res) => {
    if (!req.file) {
      console.error('UPLOAD ERROR: No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Debug log path and filename
    console.log('UPLOAD SUCCESS:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path
    });
    // Return public URL
    const url = `/uploads/sponsor-logos/${req.file.filename}`;
    console.log('UPLOAD RESPONSE URL:', url);
    res.json({ url });
  }
];
