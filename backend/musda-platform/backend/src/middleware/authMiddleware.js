const jwt = require('jsonwebtoken');

// Middleware: cek JWT dan role
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'musda_secret');
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
}

// Middleware: hanya admin
function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Akses hanya untuk admin' });
  }
  next();
}

// Middleware: admin atau panitia
function panitiaOrAdminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'panitia') {
    return res.status(403).json({ message: 'Akses hanya untuk admin/panitia' });
  }
  next();
}

module.exports = {
  authMiddleware,
  adminMiddleware,
  panitiaOrAdminMiddleware
};
