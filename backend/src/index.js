require('dotenv').config();
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

const app = express();
const port = process.env.PORT || 3001;
// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// CORS configuration (env-driven with sensible dev defaults)
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost'
]);
app.use(cors({
  origin: (origin, cb) => {
    // allow same-origin or tools with no origin
    if (!origin) return cb(null, true);
    return allowedOrigins.has(origin) ? cb(null, true) : cb(new Error('CORS not allowed'), false);
  },
  credentials: true
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

// Register routes
app.use('/api/auth', authRoutes);
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

// Static file serving for uploaded assets from project root (/uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
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

// Centralized error/404 handlers
const { errorHandler, notFound } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
module.exports = app;
