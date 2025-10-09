const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../../uploads/sponsor-logos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function multerAvailable() {
  try { require.resolve('multer'); return true; } catch { return false; }
}

let middleware;

if (multerAvailable()) {
  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`);
    }
  });
  middleware = multer({ storage }).single('logo');
  module.exports = middleware;
} else {
  // Fallback pakai busboy manual
  const Busboy = require('busboy');
  middleware = (req, res, next) => {
    if (req.method !== 'POST') return next();
    const bb = Busboy({ headers: req.headers });
    let fileStored = false;
    let fileInfo = null;

    bb.on('file', (name, file, info) => {
      if (name !== 'logo') {
        file.resume();
        return;
      }
      const ext = path.extname(info.filename || '.dat');
      const filename = `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`;
      const saveTo = path.join(uploadDir, filename);
      const ws = fs.createWriteStream(saveTo);
      file.pipe(ws);
      fileInfo = { originalname: info.filename, filename, path: saveTo };
      fileStored = true;
    });
    bb.on('finish', () => {
      if (fileStored) {
        req.file = fileInfo;
        return next();
      }
      return res.status(400).json({ error: 'No file uploaded (fallback)' });
    });
    bb.on('error', err => next(err));
    req.pipe(bb);
  };
  module.exports = middleware;
}