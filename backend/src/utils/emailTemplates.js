const nodemailer = require('nodemailer');
const fs = require('fs');
const { sphLogoToBase64 } = require('./logoConverter');

// Email transporter configuration
let transporter = null;

if (process.env.EMAIL_ENABLED === 'true') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14
  });
  console.log('📧 Email transporter configured for e-tickets');
} else {
  console.log('📧 Email transporter disabled for e-tickets - development mode');
}

// Function to send e-ticket email
async function sendETicketEmail(participant, qrCodePath) {
  try {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log('📧 E-ticket email disabled in development mode for:', participant.email);
      return {
        success: true,
        message: 'E-ticket email sending disabled in development mode',
        mode: 'development'
      };
    }

    if (!transporter) {
      console.log('📧 No email transporter configured');
      return {
        success: false,
        message: 'Email transporter not configured'
      };
    }

    console.log('📧 Sending e-ticket email to:', participant.email);
    
    // Get logo as base64 (we will attach as CID for better client compatibility)
    // Use SPH logo specifically; fall back handled in helper
    const logoBase64 = sphLogoToBase64();
    let logoAttachment = null;
    if (logoBase64 && logoBase64.startsWith('data:image')) {
      try {
        const base64Data = logoBase64.split(',')[1];
        const logoBuffer = Buffer.from(base64Data, 'base64');
        logoAttachment = {
          filename: 'logo-sph.png',
          content: logoBuffer,
          cid: 'sphlogo',
          contentType: 'image/png'
        };
      } catch (e) {
        console.log('⚠️ Could not prepare SPH logo attachment:', e.message);
      }
    }

    // Generate unique temporary QR path to avoid conflicts
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const tempQRPath = qrCodePath.replace('.png', `_${timestamp}_${randomId}.png`);
    
    // Copy QR file to temp location if original exists
    if (fs.existsSync(qrCodePath) && qrCodePath !== tempQRPath) {
      try {
        fs.copyFileSync(qrCodePath, tempQRPath);
        console.log('📄 Created temporary QR file:', tempQRPath);
      } catch (copyError) {
        console.log('⚠️ Could not create temp QR, using original:', copyError.message);
      }
    }
    
    const qrPathToUse = fs.existsSync(tempQRPath) ? tempQRPath : qrCodePath;

    const emailHTML = `
      <div style="max-width:500px;margin:auto;background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);border-radius:20px;padding:40px 30px;font-family:'Georgia', serif;box-shadow:0 20px 60px rgba(0, 0, 0, 0.3);border:2px solid #d4af37;">
        <!-- Header dengan Logo -->
        <div style="text-align:center;margin-bottom:30px;background:linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);padding:25px;border-radius:15px;border:1px solid #d4af37;">
          ${logoBase64 ? 
            `<img src="cid:sphlogo" alt="Logo SPH" style="height:90px;margin-bottom:20px;filter:drop-shadow(0 4px 12px rgba(212, 175, 55, 0.4));" />` : 
            '<div style="width:90px;height:90px;background:linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);border-radius:15px;display:inline-flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;color:#1a1a1a;margin:0 auto 20px auto;box-shadow:0 8px 20px rgba(212, 175, 55, 0.4);">SPH</div>'
          }
          <h1 style="color:#d4af37;font-size:2.5rem;margin:0 0 10px 0;font-weight:700;letter-spacing:2px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">E-TICKET SPH 2025</h1>
          <div style="color:#f8f8f8;font-size:1.3rem;font-weight:600;margin-bottom:8px;text-shadow:0 1px 2px rgba(0,0,0,0.5);">Sekolah Properti Himperra</div>
          <div style="color:#d4af37;font-size:1rem;background:rgba(212, 175, 55, 0.1);padding:8px 20px;border-radius:25px;display:inline-block;border:1px solid #d4af37;">✨ Tiket Resmi - Jangan Hilangkan ✨</div>
        </div>

        <!-- Info Peserta -->
        <div style="background:linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.05) 100%);border-radius:15px;padding:25px;text-align:center;margin-bottom:25px;border:1px solid rgba(212, 175, 55, 0.3);">
          <div style="font-size:1.5rem;color:#f8f8f8;font-weight:700;margin-bottom:12px;text-shadow:0 1px 2px rgba(0,0,0,0.5);">Selamat Datang</div>
          <div style="font-size:1.8rem;color:#d4af37;font-weight:700;margin-bottom:15px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">${participant.nama || participant.full_name}</div>
          <div style="font-size:1.1rem;color:#e0e0e0;margin-bottom:6px;font-weight:500;">${participant.instansi || participant.institution || 'Tidak disebutkan'}</div>
          <div style="font-size:1rem;color:#d4af37;margin-bottom:6px;font-weight:500;">${participant.email}</div>
          <div style="font-size:1rem;color:#c0c0c0;margin-bottom:6px;">${participant.nomor_telepon || participant.phone}</div>
          <div style="font-size:1rem;color:#d4af37;margin-bottom:15px;background:rgba(212, 175, 55, 0.1);padding:6px 15px;border-radius:20px;display:inline-block;border:1px solid rgba(212, 175, 55, 0.3);">Ticket #${participant.id.toString().padStart(4, '0')}</div>
          
          <!-- QR Code -->
          <div style="margin:20px 0;">
            <div style="background:linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%);border-radius:15px;padding:20px;display:inline-block;box-shadow:0 8px 25px rgba(0, 0, 0, 0.3);border:3px solid #d4af37;">
              <img src="cid:qrcode" alt="QR Code" style="width:200px;height:200px;border-radius:10px;" />
            </div>
          </div>
          
          <div style="color:#d4af37;font-size:1.1rem;font-weight:700;margin-bottom:8px;text-shadow:0 1px 2px rgba(0,0,0,0.5);">📱 Scan QR Code untuk Check-in</div>
          <div style="color:#e0e0e0;font-size:0.95rem;">Tunjukkan QR ini saat registrasi di lokasi acara</div>
        </div>

        <!-- Status Berhasil -->
        <div style="background:linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);border-radius:15px;padding:20px;text-align:center;color:#ffffff;font-size:1.3rem;font-weight:700;margin-bottom:25px;box-shadow:0 6px 20px rgba(39, 174, 96, 0.3);border:2px solid #2ecc71;">
          🎉 REGISTRASI SPH 2025 BERHASIL! 🎉
        </div>

        <!-- Footer -->
        <div style="text-align:center;color:#c0c0c0;font-size:1rem;margin-top:30px;line-height:1.8;padding-top:25px;border-top:2px solid #d4af37;">
          <div style="background:linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.05) 100%);padding:20px;border-radius:15px;border:1px solid rgba(212, 175, 55, 0.3);">
            <div style="color:#d4af37;font-weight:700;font-size:1.4rem;margin-bottom:12px;text-shadow:0 1px 2px rgba(0,0,0,0.5);">🏛️ MUSDA II HIMPERRA LAMPUNG</div>
            <div style="color:#f8f8f8;margin-bottom:6px;font-weight:600;font-size:1.1rem;">Sekolah Properti Himperra</div>
            <div style="color:#e0e0e0;margin-bottom:8px;font-size:0.95rem;">Himpunan Pengembang Perumahan dan Permukiman Rakyat Daerah Lampung</div>
            <div style="color:#d4af37;font-size:0.9rem;margin-top:15px;font-style:italic;">
              ✨ Investasi Terbaik adalah Investasi Pendidikan ✨<br />
              <span style="color:#c0c0c0;">© 2025 SPH - Sekolah Properti Himperra</span>
            </div>
          </div>
        </div>
      </div>`;

    const mailOptions = {
      from: `"SPH 2025 - HIMPERRA LAMPUNG" <${process.env.SMTP_FROM}>`,
      to: participant.email,
      subject: '🎫 E-Ticket SPH 2025 - Sekolah Properti Himperra',
      html: emailHTML,
      attachments: [
        {
          filename: 'qr-code.png',
          path: qrPathToUse,
          cid: 'qrcode'
        },
        ...(logoAttachment ? [logoAttachment] : [])
      ]
    };

    await transporter.sendMail(mailOptions);
    
    // Clean up temporary QR code files
    try {
      if (fs.existsSync(tempQRPath) && tempQRPath !== qrCodePath) {
        fs.unlinkSync(tempQRPath);
        console.log('🧹 Cleaned up temporary QR file:', tempQRPath);
      }
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }
    
    console.log('✅ E-ticket email sent successfully to:', participant.email);
    return { success: true, message: 'E-ticket sent successfully' };
    
  } catch (error) {
    console.error('❌ Error sending e-ticket email:', error);
    throw error;
  }
}

module.exports = { sendETicketEmail };
// --- Admin notification email for new registrations ---
const { sendEmailUnified } = require('./emailProvider');
async function sendAdminNewRegistrationEmail(participant) {
  try {
    // Dev mode short-circuit
    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log('📧 [DEV] Admin notification disabled. New registration:', {
        id: participant.id,
        name: participant.full_name || participant.nama,
        email: participant.email,
        phone: participant.phone || participant.whatsapp,
        status: participant.payment_status,
      });
      return { success: true, mode: 'development' };
    }

    // Resolve recipients
    // Determine recipients with robust fallbacks
    // Priority: ADMIN_EMAILS -> ADMIN_EMAIL -> EMAIL_FROM -> SMTP_FROM
    const rawRcpts = process.env.ADMIN_EMAILS
      || process.env.ADMIN_EMAIL
      || process.env.EMAIL_FROM
      || process.env.SMTP_FROM;
    const toList = (rawRcpts || '')
      .split(',')
      .map(s => s.trim())
      // strip surrounding quotes if user pasted with quotes in env
      .map(s => s.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, ''))
      .filter(Boolean);
    if (toList.length === 0) {
      console.log('📧 No admin recipients configured (ADMIN_EMAILS/ADMIN_EMAIL/EMAIL_FROM/SMTP_FROM). Skipping.');
      return { success: false, message: 'No recipients' };
    }

    const subject = `🔔 Pendaftar SPH Baru: ${(participant.full_name || participant.nama || 'Peserta').toString()} (#${participant.id || '-'})`;
    // Determine admin dashboard URL (configurable via env)
    const dashUrl = (process.env.ADMIN_DASHBOARD_URL
      || process.env.FRONTEND_BASE_URL && `${process.env.FRONTEND_BASE_URL.replace(/\/$/, '')}/admin`
      || 'http://localhost:5173/admin');
    const status = (participant.payment_status || 'pending').toUpperCase();
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:10px;padding:20px">
        <h2 style="margin:0 0 10px 0">🔔 Pendaftar Baru SPH 2025</h2>
        <p style="margin:0 0 10px 0;color:#555">Ada pendaftaran baru masuk. Mohon ditinjau dan tindak lanjuti (WA).</p>
        <table style="width:100%;font-size:14px;color:#333">
          <tr><td style="width:160px;color:#666">ID</td><td><b>${participant.id || '-'}</b></td></tr>
          <tr><td style="color:#666">Nama</td><td><b>${participant.full_name || participant.nama || '-'}</b></td></tr>
          <tr><td style="color:#666">Email</td><td>${participant.email || '-'}</td></tr>
          <tr><td style="color:#666">Telepon</td><td>${participant.phone || participant.whatsapp || '-'}</td></tr>
          <tr><td style="color:#666">Instansi</td><td>${participant.institution || participant.instihtion || participant.asal_instansi || '-'}</td></tr>
          <tr><td style="color:#666">Level</td><td>${participant.experience_level || participant.kategori || '-'}</td></tr>
          <tr><td style="color:#666">Metode Bayar</td><td>${participant.payment_method || '-'}</td></tr>
          <tr><td style="color:#666">Kode Bayar</td><td>${participant.payment_code || participant.paymentCode || '-'}</td></tr>
          <tr><td style="color:#666">Status</td><td><b>${status}</b></td></tr>
        </table>
        <div style="margin-top:18px;text-align:center">
          <a href="${dashUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#2d6cdf;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">
            Buka Dashboard Admin SPH
          </a>
        </div>
        <p style="margin-top:16px;color:#555">Admin dapat segera menghubungi peserta via WhatsApp untuk mengirimkan e-ticket/QR jika diperlukan.</p>
      </div>
    `;

    // Prefer unified provider (Resend or SMTP host) for Railway compatibility
    try {
      await sendEmailUnified({
        from: process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER,
        to: toList,
        subject,
        html
      });
    } catch (primaryErr) {
      // Fallback to nodemailer transporter if available
      if (!transporter) throw primaryErr;
      const mailOptions = {
        from: `"SPH 2025 - Notifier" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: toList,
        subject,
        html
      };
      await transporter.sendMail(mailOptions);
    }
    console.log('✅ Admin notification sent for participant:', participant.id);
    return { success: true };
  } catch (err) {
    console.error('❌ Error sending admin notification:', err);
    return { success: false, message: err.message };
  }
}

module.exports.sendAdminNewRegistrationEmail = sendAdminNewRegistrationEmail;