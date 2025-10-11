require('dotenv').config();
// Prefer IPv4 resolution first to avoid IPv6-only connect issues inside container
try {
  const dns = require('dns');
  if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
} catch(_) { /* ignore */ }
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
// Extra diagnostics for production fallback (Railway MYSQL* vars)
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

const app = express();

// Derive safe HTTP port: avoid accidentally binding to 3306 (MySQL) when PORT env polluted by DB vars
function resolveHttpPort() {
  const raw = process.env.PORT;
  const num = raw ? parseInt(raw, 10) : null;
  if (num && num !== 3306) return num; // normal case
  const fallback = parseInt(process.env.APP_PORT || '8080', 10);
  if (num === 3306) {
    console.warn('[PORT] Detected PORT=3306 (likely MySQL port). Overriding to fallback', fallback);
  }
  return fallback;
}
const port = resolveHttpPort();
// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// CORS configuration (env-driven with sensible dev defaults + Netlify preview support)
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost'
]);

// Support comma-separated FRONTEND_ORIGINS for additional explicit origins
const extraOriginsRaw = (process.env.FRONTEND_ORIGINS || '').split(',')
  .map(s => s.trim()).filter(Boolean);
extraOriginsRaw.forEach(o => {
  if (/^https?:\/\//i.test(o)) allowedOrigins.add(o.replace(/\/$/, '')); // normalize
});

// Pattern based whitelist (preview subdomains etc.)
const allowedOriginPatterns = [
  // Netlify production + preview subdomains: <hash>--himperra-lampung.netlify.app
  /^https?:\/\/([a-z0-9-]+--)?himperra-lampung\.netlify\.app$/i,
  // Allow optional custom wildcard domains via FRONTEND_ORIGINS tokens like *.example.com
  ...extraOriginsRaw.filter(o => o.startsWith('*.')).map(glob => {
    const base = glob.slice(2).replace(/[-/\\^$+?.()|[\]{}]/g, r => `\\${r}`);
    return new RegExp(`^https?:\\/\\/([a-z0-9-]+\\.)?${base}$`, 'i');
  })
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / server-to-server
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.has(normalized)) return cb(null, true);
    if (allowedOriginPatterns.some(re => re.test(normalized))) return cb(null, true);
    console.warn('[CORS] Blocked origin:', origin);
    return cb(new Error('CORS not allowed'), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept','Origin'],
  exposedHeaders: ['Content-Disposition']
}));
app.use(bodyParser.json());

// Response alias middleware: convert *_path to *_url for convenience
app.use((req,res,next)=>{
  const originalJson = res.json.bind(res);
  res.json = (body)=>{
    try {
      const transform = (obj)=>{
        if (obj && typeof obj === 'object') {
          Object.keys(obj).forEach(k=>{
            if (/(_path)$/.test(k) && typeof obj[k] === 'string' && !obj[k.replace(/_path$/,'_url')]) {
              const urlKey = k.replace(/_path$/, '_url');
              obj[urlKey] = obj[k];
            }
            const v = obj[k];
            if (Array.isArray(v)) v.forEach(transform); else if (v && typeof v === 'object') transform(v);
          });
        }
      };
      transform(body);
    } catch(e) { /* silent */ }
    return originalJson(body);
  };
  next();
});


// Koneksi MySQL
const db = require('./utils/db');

// Routing dasar
app.get('/', (req, res) => {
  res.send('MUSDA II API running');
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const panitiaRoutes = require('./routes/panitiaRoutes');
const guestRoutes = require('./routes/guestRoutes');
const countdownRoutes = require('./routes/countdownRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const sponsorUploadRoutes = require('./routes/sponsorUploadRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const participantRoutes = require('./routes/participantRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const sphContentRoutes = require('./routes/sphContentRoutes');
const sphSettingsRoutes = require('./routes/sphSettingsRoutes');
const sphParticipantRoutes = require('./routes/sphParticipantRoutes');
const sphPaymentSettingsRoutes = require('./routes/sphPaymentSettingsRoutes');
const testQRRoutes = require('./routes/testQRRoutes');
const setupRoutes = require('./routes/setupRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const posterRoutes = require('./routes/posterRoutes');
const profileRoutes = require('./routes/profileRoutes');
const contentRoutes = require('./routes/contentRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const systemRoutes = require('./routes/systemRoutes');
const locationRoutes = require('./routes/locationRoutes');
const newsRoutes = require('./routes/newsRoutes');
const emailHealthRoutes = require('./routes/emailHealthRoutes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailHealthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/panitia', panitiaRoutes);
app.use('/api', guestRoutes);
app.use('/api/countdown', countdownRoutes);
app.use('/api', sponsorRoutes);
app.use('/api', sponsorUploadRoutes);
app.use('/api/agendas', agendaRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sph-content', sphContentRoutes);
app.use('/api/sph-settings', sphSettingsRoutes);
app.use('/api/sph-participants', sphParticipantRoutes);
app.use('/api/sph-payment-settings', sphPaymentSettingsRoutes);
app.use('/api/test', testQRRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/poster', posterRoutes);
app.use('/api', profileRoutes);
app.use('/api', contentRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api', locationRoutes);
app.use('/api', newsRoutes);

// Development: list registered routes for debugging 404 issues
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/_routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((m) => {
      if (m.route && m.route.path) {
        const methods = Object.keys(m.route.methods).filter(k => m.route.methods[k]).join(',').toUpperCase();
        routes.push({ method: methods, path: m.route.path });
      } else if (m.name === 'router' && m.handle.stack) {
        m.handle.stack.forEach((h) => {
          if (h.route && h.route.path) {
            const methods = Object.keys(h.route.methods).filter(k => h.route.methods[k]).join(',').toUpperCase();
            // Base path from parent layer regexp (extract if available)
            let base = m.regexp && m.regexp.source ? m.regexp.source : '';
            // Attempt to reconstruct base path (simple heuristic)
            if (m.regexp && m.regexp.fast_star) base = '*';
            routes.push({ method: methods, path: (m.regexp && m.regexp.fast_slash ? '' : extractPath(m.regexp)) + h.route.path });
          }
        });
      }
    });
    res.json({ count: routes.length, routes });
  });
}

function extractPath(regexp) {
  if (!regexp || !regexp.source) return '';
  // Convert something like /^\/api\/?(?=\/|$)/i to /api
  const match = regexp.source.match(/\\\/(.*?)\\\//);
  if (match && match[1]) return '/' + match[1].replace(/\\/g, '');
  return '';
}

// Static file serving for uploaded assets from project root or /tmp on Vercel
const path = require('path');
const { UPLOADS_ABS_ROOT } = require('./utils/paths');
const fs = require('fs');
try { fs.mkdirSync(UPLOADS_ABS_ROOT, { recursive: true }); } catch(_) {}
app.use('/uploads', express.static(UPLOADS_ABS_ROOT, {
  setHeaders: (res, filePath)=>{
    if (/\.(png|jpe?g|webp|gif|svg)$/i.test(filePath)) {
      res.setHeader('Cache-Control','public, max-age=604800, immutable'); // 7 days
    } else {
      res.setHeader('Cache-Control','public, max-age=300'); // 5 minutes
    }
  }
}));

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'MUSDA II API running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Explicit /api/health endpoint for platform health checks
app.get('/api/health', async (req, res) => {
  try {
    const { dbPromise } = require('./utils/db');
    await dbPromise.query('SELECT 1');
    res.json({ status: 'ok', db: 'up', time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'down', error: e.message });
  }
});

// Centralized error/404 handlers
const { errorHandler, notFound } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  try {
    console.log(`[BOOT] MIGRATE_ON_START flag value: ${process.env.MIGRATE_ON_START}`);
    if (process.env.MIGRATE_ON_START === '1') {
      const delayMs = parseInt(process.env.MIGRATION_START_DELAY_MS || '0', 10);
      if (delayMs > 0) {
        console.log(`[BOOT] MIGRATE_ON_START=1 delaying migration start for ${delayMs}ms to allow DB warm-up...`);
        await new Promise(r=>setTimeout(r, delayMs));
      } else {
        console.log('[BOOT] MIGRATE_ON_START=1 detected. Running migrations before server start...');
      }
      try {
        const { runMigrations } = require('../scripts/run-sql-migrations');
        await runMigrations({ apply: true });
        console.log('[BOOT] Migrations completed.');
      } catch (e) {
        console.error('[BOOT] Migration phase failed:', e.message);
        if (process.env.MIGRATION_STRICT === '1') {
          console.error('[BOOT] MIGRATION_STRICT=1 set. Aborting startup.');
          process.exit(1);
        }
      }
    } else {
      console.log('[BOOT] MIGRATE_ON_START not set to 1. Skipping automatic migration phase.');
    }

    // Fallback: ensure guests table exists (some deploys missed new migration 13)
    try {
      const { dbPromise } = require('./utils/db');
      const [rows] = await dbPromise.query("SHOW TABLES LIKE 'guests'");
      if (!rows || rows.length === 0) {
        console.warn('[BOOT][FALLBACK] guests table missing. Creating fallback schema now...');
        await dbPromise.query(`CREATE TABLE IF NOT EXISTS guests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nama VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL UNIQUE,
          whatsapp VARCHAR(30) NOT NULL,
          asal_instansi VARCHAR(150) NOT NULL,
          kota VARCHAR(100) NULL,
            kategori VARCHAR(100) NULL,
          status_kehadiran ENUM('pending','hadir') DEFAULT 'pending',
          qr_code VARCHAR(191) NULL,
          verification_token VARCHAR(191) NULL,
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_guests_whatsapp (whatsapp),
          INDEX idx_guests_status (status_kehadiran),
          INDEX idx_guests_token (verification_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
        console.log('[BOOT][FALLBACK] guests table created.');
      } else {
        console.log('[BOOT] guests table present.');
      }
    } catch (e) {
      console.error('[BOOT][FALLBACK] Failed ensuring guests table:', e.message);
    }
    if (!process.env.VERCEL) {
      app.listen(port, () => {
        console.log(`[BOOT] MUSDA backend listening on :${port} (env=${process.env.NODE_ENV || 'development'})`);
      });
    } else {
      console.log('[BOOT] Detected Vercel environment, exporting handler without app.listen');
    }
  } catch (err) {
    console.error('[BOOT] Fatal startup error:', err);
    process.exit(1);
  }
}
bootstrap();

module.exports = app; // keep export for serverless compatibility
