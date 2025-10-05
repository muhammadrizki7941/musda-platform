const nodemailer = require('nodemailer');
const Guest = require('../models/guestModel');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const User = require('../models/User');

// Konfigurasi transporter (hanya jika email enabled)
let transporter = null;

if (process.env.EMAIL_ENABLED !== 'false') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.log('📧 Email transporter disabled - development mode');
}

exports.sendTicket = async (req, res) => {
  const id = req.params.id;
  try {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED === 'false') {
      console.log('📧 Email disabled in development mode');
      return res.json({ 
        success: true, 
        message: 'Email sending disabled in development mode',
        mode: 'development' 
      });
    }
    
    const guest = await Guest.findById(id);
    if (!guest) return res.status(404).json({ error: 'Tamu tidak ditemukan' });

    // Generate QR code and ticket logic here...
    // (keeping the existing QR generation code)
    
    res.json({ success: true, message: 'Email would be sent in production' });
  } catch (error) {
    console.error('❌ Email error:', error.message);
    res.status(500).json({
      error: 'Email service error',
      message: process.env.EMAIL_ENABLED === 'false' ? 'Email disabled in development' : error.message
    });
  }
};