const jwt = require('jsonwebtoken');

// Middleware: cek JWT dan role
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'musda_secret');
    req.user = user;
    // Optional debug (enable by setting DEBUG_AUTH=1 in env)
    if (process.env.DEBUG_AUTH === '1') {
      console.log('[authMiddleware] Decoded user:', user);
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
}

// Middleware: hanya admin
function adminMiddleware(req, res, next) {
  // Allow both 'admin' and elevated 'super_admin'
  if (!['admin', 'super_admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Akses hanya untuk admin' });
  }
  next();
}

// Middleware: admin atau panitia
function panitiaOrAdminMiddleware(req, res, next) {
  // Permit admin, super_admin, or panitia
  if (!['admin', 'super_admin', 'panitia'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Akses hanya untuk admin/panitia' });
  }
  next();
}

module.exports = {
  authMiddleware,
  adminMiddleware,
  panitiaOrAdminMiddleware
};
