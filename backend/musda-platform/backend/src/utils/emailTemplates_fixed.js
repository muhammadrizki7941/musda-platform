const nodemailer = require('nodemailer');
const fs = require('fs');
const { logoToBase64 } = require('./logoConverter');

// Email transporter configuration - only if email is enabled
let transporter = null;

if (process.env.EMAIL_ENABLED !== 'false') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-email-password'
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

// Function to send e-ticket email with modern design like MUSDA
async function sendETicketEmail(participant, qrCodePath) {
  try {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED === 'false') {
      console.log('📧 E-ticket email disabled in development mode for:', participant.email);
      return {
        success: true,
        message: 'E-ticket email sending disabled in development mode',
        mode: 'development'
      };
    }

    console.log('📧 Email template received participant with payment_status:', participant.payment_status);
    
    // Get logo as base64
    console.log('🔍 Loading SPH logo for email...');
    const logoBase64 = logoToBase64();
    
    if (!logoBase64) {
      console.log('⚠️ Warning: Logo could not be loaded, using fallback');
    } else {
      console.log('✅ SPH logo loaded successfully for email');
      console.log('📏 Logo base64 length:', logoBase64.length);
      console.log('🔤 Logo starts with:', logoBase64.substring(0, 50));
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
    console.log('📍 Using QR file:', qrPathToUse);

    const emailHTML = `
      <div style="max-width:480px;margin:auto;background:#fff;border-radius:18px;padding:36px 28px;font-family:'Segoe UI',sans-serif;box-shadow:0 8px 32px rgba(102, 126, 234, 0.1);">
        <div style="text-align:center;margin-bottom:24px;">
          ${logoBase64 ? 
            `<img src="${logoBase64}" alt="Logo SPH" style="height:80px;margin-bottom:15px;border-radius:12px;box-shadow:0 4px 16px rgba(102, 126, 234, 0.2);" />` : 
            '<div style="width:80px;height:80px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;color:white;margin:0 auto 15px auto;box-shadow:0 4px 16px rgba(102, 126, 234, 0.3);">SPH</div>'
          }
          <h2 style="color:#333;font-size:2.2rem;margin:0 0 10px 0;font-weight:700;letter-spacing:1px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">E-Ticket SPH 2025</h2>
          <div style="color:#667eea;font-size:1.25rem;font-weight:600;margin-bottom:4px;">Sekolah Properti Himperra</div>
          <div style="color:#888;font-size:1rem;margin-bottom:14px;background:linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);padding:8px 16px;border-radius:20px;display:inline-block;">Tiket Resmi - Jangan Hilangkan</div>
        </div>

        <div style="background:linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);border-radius:14px;padding:24px 18px;text-align:center;margin-bottom:22px;border:2px solid #667eea20;">
          <div style="font-size:1.4rem;color:#333;font-weight:700;margin-bottom:8px;">Halo, ${participant.nama || participant.full_name}!</div>
          <div style="font-size:1.1rem;color:#555;margin-bottom:4px;font-weight:500;">${participant.instansi || participant.institution || 'Tidak disebutkan'}</div>
          <div style="font-size:1rem;color:#667eea;margin-bottom:4px;font-weight:500;">${participant.email}</div>
          <div style="font-size:1rem;color:#888;margin-bottom:4px;">${participant.nomor_telepon || participant.phone}</div>
          <div style="font-size:0.95rem;color:#888;margin-bottom:8px;">Ticket #${participant.id.toString().padStart(4, '0')}</div>
          
          <div style="margin:16px 0;">
            <div style="background:white;border-radius:12px;padding:16px;display:inline-block;box-shadow:0 4px 12px rgba(102, 126, 234, 0.1);">
              <img src="cid:qrcode" alt="QR Code" style="width:180px;height:180px;border-radius:8px;" />
            </div>
          </div>
          
          <div style="color:#667eea;font-size:1rem;font-weight:600;margin-bottom:4px;">📱 Scan QR Code untuk Check-in</div>
          <div style="color:#888;font-size:0.9rem;">Tunjukkan QR ini saat registrasi di lokasi acara</div>
        </div>

        <div style="background:linear-gradient(135deg, #dcfce7, #bbf7d0);border-radius:12px;padding:16px;text-align:center;color:#16a34a;font-size:1.2rem;font-weight:700;margin-bottom:20px;border:2px solid #16a34a30;">
          🎉 Registrasi SPH Berhasil!
        </div>

        <div style="text-align:center;color:#888;font-size:1rem;margin-top:24px;line-height:1.6;padding-top:20px;border-top:2px dashed #667eea30;">
          <div style="color:#667eea;font-weight:700;font-size:1.2rem;margin-bottom:8px;">🏛️ SPH 2025 - HIMPERRA LAMPUNG</div>
          <div style="color:#555;margin-bottom:4px;font-weight:500;">Sekolah Properti Himperra</div>
          <div style="color:#888;margin-bottom:8px;">Himpunan Pengembang Perumahan dan Permukiman Rakyat Daerah Lampung</div>
          <div style="margin-top:12px;color:#aaa;font-size:0.85rem;">
            🌟 Investasi Terbaik adalah Investasi Pendidikan 🌟<br />
            © 2025 SPH - Sekolah Properti Himperra
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@sph.com',
      to: participant.email,
      subject: '🎫 E-Ticket SPH 2025 - Sekolah Properti Himperra',
      html: emailHTML,
      attachments: [
        {
          filename: 'qr-code.png',
          path: qrPathToUse,
          cid: 'qrcode'
        }
      ]
    };

    console.log('📧 Sending e-ticket email to:', participant.email);
    console.log('📎 Using QR attachment:', qrPathToUse);
    
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
    if (process.env.EMAIL_ENABLED === 'false') {
      return {
        success: true,
        message: 'Email disabled in development mode',
        mode: 'development'
      };
    }
    throw error;
  }
}

module.exports = { sendETicketEmail };