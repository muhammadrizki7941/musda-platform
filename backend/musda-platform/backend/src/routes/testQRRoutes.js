const express = require('express');
const router = express.Router();
const { generateQRTemplate } = require('../utils/qrTemplateGenerator');
const { getUploadsAbsPath, getUploadsPublicPath } = require('../utils/paths');
const path = require('path');
const fs = require('fs');

// Test endpoint untuk generate QR template baru
router.get('/test-qr-template', async (req, res) => {
  try {
    // Test data
    const testParticipant = {
      id: 999,
      nama: 'Test User',
      instansi: 'Test Institution',
      email: 'test@example.com',
      nomor_telepon: '081234567890',
      payment_status: 'paid'
    };
    
    const qrData = `SPH-TICKET-TEST-${Date.now()}`;
    const filename = `test_template_${Date.now()}.png`;
    const absPath = getUploadsAbsPath('qr_codes', filename);
    const publicPath = `/${getUploadsPublicPath('qr_codes', filename)}`;

    // Ensure directory exists
    const qrDir = path.dirname(absPath);
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Generate QR template with new MUSDA II design
    await generateQRTemplate(qrData, testParticipant, absPath);

    console.log('✅ Test QR template generated:', absPath);

    res.json({
      success: true,
      message: 'Test QR template generated successfully',
      path: absPath,
      publicPath,
      downloadUrl: `http://localhost:5001${publicPath}`
    });
    
  } catch (error) {
    console.error('❌ Error generating test QR template:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating test QR template',
      error: error.message
    });
  }
});

module.exports = router;