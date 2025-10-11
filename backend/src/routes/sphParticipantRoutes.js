const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const SPHParticipantModel = require('../models/sphParticipantModel');
const SPHPaymentSettingsModel = require('../models/sphPaymentSettingsModel');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { logoToBase64 } = require('../utils/logoConverter');
const { sendETicketEmail, sendAdminNewRegistrationEmail } = require('../utils/emailTemplates');
const { generateQRTemplate } = require('../utils/qrTemplateGenerator');
const { getUploadsAbsPath, getUploadsPublicPath } = require('../utils/paths');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  // Configure based on your email service
  service: 'gmail', // or your email service
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-email-password'
  }
});

// Get all SPH participants
router.get('/', authMiddleware, async (req, res) => {
  try {
    const participants = await SPHParticipantModel.getAllParticipants();
    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error('Error fetching SPH participants:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Public endpoint for testing (count only)
router.get('/count', async (req, res) => {
  try {
    const participants = await SPHParticipantModel.getAllParticipants();
    res.json({
      success: true,
      count: participants.length,
      message: 'SPH Participants endpoint working'
    });
  } catch (error) {
    console.error('Error fetching SPH participants count:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Export SPH participants data (must be before /:id route)
router.get('/export/csv', authMiddleware, async (req, res) => {
  try {
    const participants = await SPHParticipantModel.getAllParticipants();
    
    // Create CSV content
    const csvHeader = 'ID,Nama,Email,Telepon,Instansi,Level,Status,Metode Bayar,Tanggal Daftar,Tanggal Bayar\n';
    const csvContent = participants.map(p => {
      return `${p.id},"${p.full_name}","${p.email}","${p.phone}","${p.institution || ''}","${p.experience_level}","${p.payment_status}","${p.payment_method}","${p.registration_date}","${p.payment_date || ''}"`;
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sph_participants.csv"');
    res.send(csvHeader + csvContent);
  } catch (error) {
    console.error('Error exporting participants:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
});

// Register new SPH participant (public endpoint - must be before /:id route)
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      institution,
      experience_level,
      payment_method
    } = req.body;

    // Validate required fields (sesuai dengan struktur tabel)
    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, dan nomor telepon wajib diisi'
      });
    }

    // Set default values untuk optional fields
    const finalData = {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      institution: institution ? institution.trim() : null,
      experience_level: experience_level || 'pemula',
      payment_method: 'manual'
    };

    // Check if email already exists
    const emailExists = await SPHParticipantModel.checkEmailExists(finalData.email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Generate payment code
    const paymentCode = `SPH${Date.now()}${Math.floor(Math.random() * 1000)}`;
    finalData.payment_code = paymentCode;

    // Get dynamic pricing from payment settings
    let paymentAmount = 150000; // fallback default
    let isFree = false;
    try {
      const pricingInfo = await SPHPaymentSettingsModel.getPricingInfo();
      if (pricingInfo.is_free) {
        isFree = true;
        paymentAmount = 0;
      } else {
      // Determine pricing based on experience level
      // If 'pemula' assume student pricing, if 'menengah'/'ahli' use general pricing
      if (finalData.experience_level === 'pemula') {
        paymentAmount = pricingInfo.student || 100000;
      } else {
        paymentAmount = pricingInfo.general || 150000;
      }
      }
    } catch (error) {
      console.error('Error fetching pricing info, using fallback:', error);
    }

  // Create participant
  const participantId = await SPHParticipantModel.createParticipant(finalData);
  // Fetch created participant for notification context
  const createdParticipant = await SPHParticipantModel.getParticipantById(participantId);

    // If free mode, auto-mark as paid and send e-ticket immediately
    if (isFree) {
      try {
        await SPHParticipantModel.updatePaymentStatus(participantId, 'paid');
        const updatedParticipant = await SPHParticipantModel.getParticipantById(participantId);

        // Generate QR and send e-ticket (reuse the same logic as accept-payment)
        const qrData = `SPH|${updatedParticipant.payment_code}`;
        const filenameTemplate = `sph_${participantId}_template.png`;
        const filenameSimple = `sph_${participantId}_simple.png`;
        const absTemplatePath = getUploadsAbsPath('qr_codes', filenameTemplate);
        const absSimplePath = getUploadsAbsPath('qr_codes', filenameSimple);
        const uploadsDir = path.dirname(absTemplatePath);
        const publicTemplatePath = `/${getUploadsPublicPath('qr_codes', filenameTemplate)}`;

        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        await generateQRTemplate(qrData, updatedParticipant, absTemplatePath);
        await QRCode.toFile(absSimplePath, qrData, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
          errorCorrectionLevel: 'M'
        });

        await SPHParticipantModel.updateQRCode(participantId, publicTemplatePath);
        await sendETicketEmail(updatedParticipant, absSimplePath);
        // Notify admins about new (auto-paid) registration
        setImmediate(() => {
          sendAdminNewRegistrationEmail(updatedParticipant).catch(e => console.error('Admin notify error:', e));
        });

        return res.status(201).json({
          success: true,
          message: 'Pendaftaran berhasil (Gratis). E-ticket telah dikirim ke email Anda.',
          data: {
            id: participantId,
            paymentCode: paymentCode,
            status: 'paid',
            amount: 0,
            message: 'Pendaftaran gratis - tidak perlu pembayaran. Cek email untuk e-ticket.'
          }
        });
      } catch (freeErr) {
        console.error('Error auto-sending free SPH ticket:', freeErr);
        // If email/QR generation fails, still return free registration success without email
        return res.status(201).json({
          success: true,
          message: 'Pendaftaran berhasil (Gratis).',
          data: {
            id: participantId,
            paymentCode: paymentCode,
            status: 'paid',
            amount: 0,
            message: 'Pendaftaran gratis - tidak perlu pembayaran.'
          }
        });
      }
    }

    // Notify admins about new registration (pending)
    setImmediate(() => {
      sendAdminNewRegistrationEmail(createdParticipant).catch(e => console.error('Admin notify error:', e));
    });

    // Paid mode (not free): return pending with amount
    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil',
      data: {
        id: participantId,
        paymentCode: paymentCode,
        status: 'pending',
        amount: paymentAmount,
        message: 'Silakan lakukan pembayaran sesuai metode yang dipilih'
      }
    });
  } catch (error) {
    console.error('Error registering SPH participant:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
    });
  }
});

// Delete SPH participant - Must be before generic /:id route
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const participantId = req.params.id;
    const participant = await SPHParticipantModel.getParticipantById(participantId);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Delete QR code file if exists
    if (participant.qr_code_path && fs.existsSync(participant.qr_code_path)) {
      try {
        fs.unlinkSync(participant.qr_code_path);
      } catch (fileError) {
        console.log('Warning: Could not delete QR code file:', fileError.message);
      }
    }

    // Delete participant from database
    const deleted = await SPHParticipantModel.deleteParticipant(participantId);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Participant deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete participant'
      });
    }
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting participant'
    });
  }
});

// Get single SPH participant
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const participant = await SPHParticipantModel.getParticipantById(req.params.id);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }
    res.json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Error fetching SPH participant:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching participant'
    });
  }
});

// Accept payment for SPH participant
router.put('/:id/accept-payment', authMiddleware, async (req, res) => {
  try {
    const participantId = req.params.id;
    const participant = await SPHParticipantModel.getParticipantById(participantId);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    if (participant.payment_status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not in pending status'
      });
    }

    // Update payment status
    await SPHParticipantModel.updatePaymentStatus(participantId, 'paid');

    // Get updated participant data with new payment status
    const updatedParticipant = await SPHParticipantModel.getParticipantById(participantId);
    console.log('📧 Sending e-ticket with payment status:', updatedParticipant.payment_status);

  // Generate QR code dalam dua versi dengan penulisan file di project-root /uploads
  // Gunakan payload QR yang stabil agar bisa divalidasi saat scan:
  // Format: "SPH|<payment_code>"
  const qrData = `SPH|${updatedParticipant.payment_code}`;
  const filenameTemplate = `sph_${participantId}_template.png`;
  const filenameSimple = `sph_${participantId}_simple.png`;
  const absTemplatePath = getUploadsAbsPath('qr_codes', filenameTemplate);
  const absSimplePath = getUploadsAbsPath('qr_codes', filenameSimple);
  const uploadsDir = path.dirname(absTemplatePath);
  const publicTemplatePath = `/${getUploadsPublicPath('qr_codes', filenameTemplate)}`;
  const publicSimplePath = `/${getUploadsPublicPath('qr_codes', filenameSimple)}`;

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate professional QR template for download (ABSOLUTE PATH)
    await generateQRTemplate(qrData, updatedParticipant, absTemplatePath);
    
    // Generate simple QR code for email attachment (ABSOLUTE PATH)
    await QRCode.toFile(absSimplePath, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    // Update participant with QR code path
    await SPHParticipantModel.updateQRCode(participantId, publicTemplatePath);

    // Send e-ticket email dengan simple QR code (gunakan absolute path untuk attachment)
    // Kirim email e-ticket di background agar response cepat
    setImmediate(async () => {
      try {
        await sendETicketEmail(updatedParticipant, absSimplePath);
      } catch (err) {
        console.error('Error sending e-ticket email (async):', err);
      }
    });

    res.json({
      success: true,
      message: 'Payment accepted, e-ticket akan dikirim ke email Anda dalam beberapa menit.'
    });
  } catch (error) {
    console.error('Error accepting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting payment'
    });
  }
});

// Reject payment for SPH participant
router.put('/:id/reject-payment', authMiddleware, async (req, res) => {
  try {
    const participantId = req.params.id;
    const participant = await SPHParticipantModel.getParticipantById(participantId);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Update payment status to cancelled
    await SPHParticipantModel.updatePaymentStatus(participantId, 'cancelled');

    res.json({
      success: true,
      message: 'Payment rejected'
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting payment'
    });
  }
});

// Send e-ticket (resend)
router.post('/:id/send-ticket', authMiddleware, async (req, res) => {
  try {
    const participantId = req.params.id;
    const participant = await SPHParticipantModel.getParticipantById(participantId);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    if (participant.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not confirmed yet'
      });
    }

  // Always (re)generate a fresh, simple QR image for email attachments (not the full template)
  // Gunakan payload QR yang stabil agar bisa divalidasi saat scan: "SPH|<payment_code>"
  const qrData = `SPH|${participant.payment_code}`;
    const filenameSimple = `sph_${participantId}_simple.png`;
    const absSimplePath = getUploadsAbsPath('qr_codes', filenameSimple);

    // Ensure directory exists
    const qrDir = path.dirname(absSimplePath);
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Generate simple QR image (pure QR, no template) for email
    await QRCode.toFile(absSimplePath, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Resend e-ticket email with simple QR image
    // Kirim email e-ticket di background agar response cepat
    setImmediate(async () => {
      try {
        await sendETicketEmail(participant, absSimplePath);
      } catch (err) {
        console.error('Error sending e-ticket email (async):', err);
      }
    });

    res.json({
      success: true,
      message: 'Permintaan diterima, e-ticket akan dikirim ke email Anda dalam beberapa menit.'
    });
  } catch (error) {
    console.error('Error sending ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending ticket'
    });
  }
});

// Download professional QR template
router.get('/:id/download-qr-template', authMiddleware, async (req, res) => {
  try {
    const participantId = req.params.id;
    const participant = await SPHParticipantModel.getParticipantById(participantId);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    if (participant.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not confirmed yet'
      });
    }

  // Generate QR template for download using stable payload: "SPH|<payment_code>"
  const qrData = `SPH|${participant.payment_code}`;
    const filename = `sph_template_${participantId}_${Date.now()}.png`;
    const absDownloadPath = getUploadsAbsPath('qr_templates', filename);
    
    // Ensure directory exists
    const qrDir = path.dirname(absDownloadPath);
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    // Generate professional QR template
    await generateQRTemplate(qrData, participant, absDownloadPath);

    // Send file for download
    res.download(absDownloadPath, `SPH_QR_Template_${participant.nama || participant.full_name}_${participantId}.png`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        if (fs.existsSync(absDownloadPath)) {
          fs.unlinkSync(absDownloadPath);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('Error generating QR template for download:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR template'
    });
  }
});

module.exports = router;
// Download e-ticket PDF
router.get('/:id/download-ticket', authMiddleware, async (req, res) => {
  try {
    const participantId = req.params.id;
    const participant = await SPHParticipantModel.getParticipantById(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }
    if (participant.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment is not confirmed yet' });
    }
    // Generate PDF ticket
    const TicketGenerator = require('../utils/ticketGenerator');
    // Mapping data peserta ke format yang dibutuhkan generator
    const mappedParticipant = {
      id: participant.id,
      nama: participant.full_name || participant.nama || '-',
      email: participant.email,
      whatsapp: participant.phone || participant.whatsapp || '-',
      kategori: participant.experience_level || participant.kategori || '-',
      asal_instansi: participant.institution || participant.asal_instansi || '-',
      paymentCode: participant.payment_code || '-',
      amount: participant.amount || 150000,
      payment_status: participant.payment_status
    };
    const ticket = await TicketGenerator.generateTicket(mappedParticipant);
    const absPdfPath = require('path').join(__dirname, '../../uploads/tickets', ticket.filename);
    if (!require('fs').existsSync(absPdfPath)) {
      return res.status(404).json({ success: false, message: 'E-ticket PDF not found' });
    }
    res.download(absPdfPath, `SPH_E-Ticket_${mappedParticipant.nama}_${participantId}.pdf`, err => {
      if (err) {
        console.error('Download PDF error:', err);
      }
    });
  } catch (error) {
    console.error('Error generating/downloading PDF ticket:', error);
    res.status(500).json({ success: false, message: 'Error generating/downloading PDF ticket' });
  }
});