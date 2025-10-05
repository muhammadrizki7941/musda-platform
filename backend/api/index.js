require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();

// CORS configuration for production
app.use(cors({
  origin: [
    'https://himperra1-r18htgbs2-muhammaad-rizkis-projects.vercel.app',
    'https://himperra1-f2uv6pd7n-muhammaad-rizkis-projects.vercel.app',
    'https://himperra1-fb5jq9rdt-muhammaad-rizkis-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(bodyParser.json());

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const authRoutes = require('./routes/authRoutes');
const countdownRoutes = require('./routes/countdownRoutes');
const guestRoutes = require('./routes/guestRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const sponsorUploadRoutes = require('./routes/sponsorUploadRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const posterRoutes = require('./routes/posterRoutes');

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/agendas', agendaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/countdown', countdownRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/sponsor', sponsorUploadRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/poster', posterRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    database: {
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
      user: process.env.DB_USER
    }
  });
});

// Export for Vercel
module.exports = (req, res) => {
  return app(req, res);
};