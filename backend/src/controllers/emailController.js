const nodemailer = require('nodemailer');
const fs = require('fs');
const Guest = require('../models/guestModel');
const QRCode = require('qrcode');
const User = require('../models/User');
const { logoToBase64 } = require('../utils/logoConverter');
const path = require('path');
const { getUploadsAbsPath } = require('../utils/paths');
const { generateMusdaTicketPNG } = require('../utils/musdaTicketGenerator');

// Email configuration
let transporter = null;

// Only create transporter if email is enabled
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
  console.log('📧 Email transporter configured');
} else {
  console.log('📧 Email transporter disabled - development mode');
}

exports.sendTicket = async (req, res) => {
  const id = req.params.id;
  
  try {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED === 'false') {
      console.log('📧 Email disabled in development mode for ticket:', id);
      return res.json({ 
        success: true, 
        message: 'Email sending disabled in development mode - ticket would be sent in production',
        mode: 'development',
        ticketId: id
      });
    }
    
    const guest = await Guest.findById(id);
    if (!guest) {
      return res.status(404).json({ error: 'Tamu tidak ditemukan' });
    }

    // Generate QR code using stored payload for reliable scanning
    const qrPayload = guest.qr_code || (guest.verification_token ? `MUSDA|${guest.verification_token}` : `MUSDA|${guest.id}`);
    const qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', width: 400, errorCorrectionLevel: 'H' });
    
    // Prepare inline logo (CID) if available
    let logoCid = null;
    let logoAttachment = null;
    const logoDataUrl = logoToBase64();
    if (logoDataUrl && logoDataUrl.startsWith('data:image')) {
      const base64 = logoDataUrl.split(',')[1];
      logoCid = 'logo-musda@musda';
      logoAttachment = {
        filename: 'logo-musda.png',
        content: Buffer.from(base64, 'base64'),
        cid: logoCid,
        contentType: 'image/png'
      };
    }

    // Create email content (use DB timestamp if available)
    const createdAt = guest.created_at ? new Date(guest.created_at) : new Date();
    const tanggalDaftar = createdAt.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    const headerLogoImg = logoCid ? `<img src="cid:${logoCid}" alt="MUSDA" style="height: 40px; display: block;"/>` : '';

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
        <div style="background: #0ea5e9; padding: 16px 24px; border-radius: 12px 12px 0 0; display:flex; align-items:center; gap:12px;">
          ${headerLogoImg}
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">E‑Tiket MUSDA II HIMPERRA Lampung</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 24px; background: #ffffff;">
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px; color:#0f172a;">Informasi Peserta</h3>
            <p style="margin: 4px 0;"><strong>Nama:</strong> ${guest.nama}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${guest.email}</p>
            <p style="margin: 4px 0;"><strong>WhatsApp:</strong> ${guest.whatsapp}</p>
            <p style="margin: 4px 0;"><strong>Instansi:</strong> ${guest.instansi || guest.asal_instansi || '-'}</p>
            <p style="margin: 4px 0;"><strong>Tanggal Daftar:</strong> ${tanggalDaftar}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <img src="cid:qrcode@musda" alt="QR Code" style="width: 220px; height: 220px;"/>
            <p style="color: #4b5563; margin-top: 10px; font-size: 14px;">Tunjukkan QR ini saat registrasi di lokasi acara.</p>
          </div>
          <div style="text-align:center; margin: 24px 0;">
            <img src="cid:eticket@musda" alt="E‑Ticket MUSDA" style="width: 100%; max-width: 640px; border:1px solid #e5e7eb; border-radius:8px;"/>
          </div>
          <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 13px; color:#334155;">
            <strong>MUSDA II HIMPERRA Lampung 2025</strong><br/>
            Terima kasih telah mendaftar. Simpan e‑tiket ini dengan baik. Jangan bagikan QR kepada orang lain.
          </div>
        </div>
      </div>
    `;

    // Send email
    // Generate designed MUSDA PNG ticket and add as attachment
    const fileName = `musda_ticket_${guest.id || id}.png`;
    const absTicketPath = getUploadsAbsPath('tickets', fileName);
    await generateMusdaTicketPNG(qrPayload, guest, absTicketPath);

    const attachments = [
      {
        filename: 'qrcode.png',
        content: qrBuffer,
        cid: 'qrcode@musda',
        contentType: 'image/png'
      },
      {
        filename: fileName,
        content: fs.readFileSync(absTicketPath),
        cid: 'eticket@musda',
        contentType: 'image/png'
      }
    ];
    if (logoAttachment) attachments.push(logoAttachment);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: guest.email,
      subject: 'E-Tiket MUSDA II HIMPERRA Lampung - ' + guest.nama,
      html: emailHTML,
      attachments
    });

    console.log(`📧 E-Tiket berhasil dikirim ke ${guest.email}`);
    
    res.json({ 
      success: true, 
      message: 'E-Tiket berhasil dikirim ke email Anda',
      guest: guest.nama,
      email: guest.email
    });
    
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    res.status(500).json({
      error: 'Email service error',
      message: process.env.EMAIL_ENABLED === 'false' ? 'Email disabled in development' : error.message,
      details: error.toString()
    });
  }
};

// Function to send ticket email (can be called from other controllers)
exports.sendTicketEmail = async (guestId, guestData = null) => {
  try {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED === 'false') {
      console.log('📧 Email disabled in development mode for ticket:', guestId);
      return { 
        success: true, 
        message: 'Email sending disabled in development mode',
        mode: 'development'
      };
    }
    
    // Get guest data; if partial data is provided (no created_at/qr_code), fetch full record
    let guest = guestData;
    if (!guest || !guest.created_at || !guest.qr_code || !guest.verification_token) {
      guest = await Guest.findById(guestId);
      if (!guest) {
        throw new Error('Tamu tidak ditemukan');
      }
    }

    // Generate QR code using stored payload for reliable scanning
    const qrPayload = guest.qr_code || (guest.verification_token ? `MUSDA|${guest.verification_token}` : `MUSDA|${guest.id || guestId}`);
    const qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', width: 400, errorCorrectionLevel: 'H' });
    
    // Create email content
    // Prepare inline logo (CID) if available
    let logoCid = null;
    let logoAttachment = null;
    const logoDataUrl2 = logoToBase64();
    if (logoDataUrl2 && logoDataUrl2.startsWith('data:image')) {
      const base64 = logoDataUrl2.split(',')[1];
      logoCid = 'logo-musda@musda';
      logoAttachment = {
        filename: 'logo-musda.png',
        content: Buffer.from(base64, 'base64'),
        cid: logoCid,
        contentType: 'image/png'
      };
    }

    // Create email content (use DB timestamp if available)
    const createdAt2 = guest.created_at ? new Date(guest.created_at) : new Date();
    const tanggalDaftar2 = createdAt2.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    const headerLogoImg2 = logoCid ? `<img src="cid:${logoCid}" alt="MUSDA" style="height: 40px; display: block;"/>` : '';

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
        <div style="background: #0ea5e9; padding: 16px 24px; border-radius: 12px 12px 0 0; display:flex; align-items:center; gap:12px;">
          ${headerLogoImg2}
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">E‑Tiket MUSDA II HIMPERRA Lampung</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 24px; background: #ffffff;">
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px; color:#0f172a;">Informasi Peserta</h3>
            <p style="margin: 4px 0;"><strong>Nama:</strong> ${guest.nama}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${guest.email}</p>
            <p style="margin: 4px 0;"><strong>WhatsApp:</strong> ${guest.whatsapp}</p>
            <p style="margin: 4px 0;"><strong>Instansi:</strong> ${guest.instansi || guest.asal_instansi || '-'}</p>
            <p style="margin: 4px 0;"><strong>Tanggal Daftar:</strong> ${guest.booking_date || tanggalDaftar2}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <img src="cid:qrcode@musda" alt="QR Code" style="width: 220px; height: 220px;"/>
            <p style="color: #4b5563; margin-top: 10px; font-size: 14px;">Tunjukkan QR ini saat registrasi di lokasi acara.</p>
          </div>
          <div style="text-align:center; margin: 24px 0;">
            <img src="cid:eticket@musda" alt="E‑Ticket MUSDA" style="width: 100%; max-width: 640px; border:1px solid #e5e7eb; border-radius:8px;"/>
          </div>
          <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 13px; color:#334155;">
            <strong>MUSDA II HIMPERRA Lampung 2024</strong><br/>
            Terima kasih telah mendaftar. Simpan e‑tiket ini dengan baik. Jangan bagikan QR kepada orang lain.
          </div>
        </div>
      </div>
    `;

    // Send email
    // Generate designed MUSDA PNG ticket and add as attachment
    const fileName2 = `musda_ticket_${guest.id || guestId}.png`;
    const absTicketPath2 = getUploadsAbsPath('tickets', fileName2);
    await generateMusdaTicketPNG(qrPayload, guest, absTicketPath2);

    const attachments = [
      {
        filename: 'qrcode.png',
        content: qrBuffer,
        cid: 'qrcode@musda',
        contentType: 'image/png'
      },
      {
        filename: fileName2,
        content: fs.readFileSync(absTicketPath2),
        cid: 'eticket@musda',
        contentType: 'image/png'
      }
    ];
    if (logoAttachment) attachments.push(logoAttachment);

    const result = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: guest.email,
      subject: 'E-Tiket MUSDA II HIMPERRA Lampung - ' + guest.nama,
      html: emailHTML,
      attachments
    });

    console.log(`📧 E-Tiket berhasil dikirim ke ${guest.email}`);
    
    return { 
      success: true, 
      message: 'E-Tiket berhasil dikirim ke email',
      guest: guest.nama,
      email: guest.email,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    throw error;
  }
};