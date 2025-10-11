const path = require('path');
const fs = require('fs');
const multer = require('multer');
let sharp; // lazy require to avoid crash if not installed yet

const uploadDir = path.join(__dirname, '../../../uploads/news-thumbnails');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + '-' + Math.round(Math.random()*1e6) + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExt = ['.png','.jpg','.jpeg','.webp'];
  const allowedMime = ['image/png','image/jpeg','image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExt.includes(ext) || !allowedMime.includes(file.mimetype)) {
    return cb(new Error('Tipe file harus jpg, jpeg, png, atau webp'), false);
  }
  cb(null, true);
};

// Batas 1MB sebelum kompresi
const upload = multer({ storage, fileFilter, limits: { fileSize: 1 * 1024 * 1024 }});

exports.uploadThumbnail = [
  upload.single('thumbnail'),
  async (req,res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      // Lazy load sharp
      if (!sharp) sharp = require('sharp');
      const originalPath = req.file.path;
      const targetName = req.file.filename.replace(path.extname(req.file.filename), '.webp');
      const targetPath = path.join(uploadDir, targetName);
      // Process: resize if width >1280, convert to webp quality 80
      await sharp(originalPath)
        .rotate()
        .resize({ width:1280, withoutEnlargement:true })
        .webp({ quality:80 })
        .toFile(targetPath);
      // Remove original if different
      if (targetPath !== originalPath) {
        fs.unlink(originalPath, ()=>{});
      }
      const url = `/uploads/news-thumbnails/${targetName}`;
      res.json({ success:true, url });
    } catch (e) {
      console.error('Thumbnail upload error:', e);
      if (e.message && e.message.includes('File too large')) {
        return res.status(400).json({ error: 'Ukuran file maksimum 1MB' });
      }
      res.status(500).json({ error: 'Gagal memproses gambar' });
    }
  }
];
