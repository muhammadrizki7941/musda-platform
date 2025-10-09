const nodemailer = require('nodemailer');
const fs = require('fs');
const Guest = require('../models/guestModel');
const QRCode = require('qrcode');
const User = require('../models/User');
const { logoToBase64 } = require('../utils/logoConverter');
const path = require('path');
const { getUploadsAbsPath } = require('../utils/paths');
const { generateMusdaTicketPNG } = require('../utils/musdaTicketGenerator');
const { sendEmailUnified } = require('../utils/emailProvider');

// Email configuration with multi-port fallback & retry
let transporter = null; // primary (first port)
let extraTransporters = []; // additional fallbacks

function buildTransport(port, secureExplicit) {
  const secure = typeof secureExplicit === 'boolean' ? secureExplicit : (process.env.SMTP_SECURE === 'true' || port === 465);
  const requireTLS = process.env.SMTP_REQUIRE_TLS !== 'false';
  const connectionTimeout = parseInt(process.env.SMTP_CONNECTION_TIMEOUT || '10000', 10); // ms
  const socketTimeout = parseInt(process.env.SMTP_SOCKET_TIMEOUT || '15000', 10); // ms
  const greetingTimeout = parseInt(process.env.SMTP_GREETING_TIMEOUT || '8000', 10);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS,
    connectionTimeout,
    socketTimeout,
    greetingTimeout,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function initTransports() {
  if (process.env.EMAIL_ENABLED === 'false') {
    console.log('📧 Email transporter disabled - development mode (EMAIL_ENABLED=false)');
    return;
  }
  try {
    const portsEnv = process.env.SMTP_PORTS || process.env.SMTP_PORT || '587,465';
    const ports = portsEnv.split(',').map(p => parseInt(p.trim(), 10)).filter(Boolean);
    if (ports.length === 0) ports.push(587, 465);
    const built = ports.map(p => buildTransport(p));
    transporter = built[0];
    extraTransporters = built.slice(1);
    console.log('📧 Email transports configured host=%s ports=%s user=%s', process.env.SMTP_HOST, ports.join('/'), process.env.SMTP_USER);
    if (process.env.DEBUG_EMAIL === '1') {
      built.forEach(t => {
        t.verify().then(()=>{
          console.log('[EMAIL] verify OK port=%s secure=%s', t.options.port, t.options.secure);
        }).catch(err=>{
          console.error('[EMAIL] verify FAIL port=%s secure=%s msg=%s', t.options.port, t.options.secure, err.message);
        });
      });
    }
  } catch (e) {
    console.error('❌ Failed to configure email transporters:', e.message);
  }
}

initTransports();

const TRANSIENT_CODES = new Set(['ETIMEDOUT','ECONNECTION','ESOCKET','ECONNRESET','EAI_AGAIN']);
const MAX_RETRIES = parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '2', 10);

async function safeSendMail(mailOptions) {
  if (process.env.EMAIL_ENABLED === 'false') {
    return { disabled: true };
  }
  const transports = [transporter, ...extraTransporters].filter(Boolean);
  let attempt = 0;
  let lastErr = null;
  for (let tIndex = 0; tIndex < transports.length; tIndex++) {
    const t = transports[tIndex];
    attempt = 0;
    while (attempt <= MAX_RETRIES) {
      try {
        if (process.env.DEBUG_EMAIL === '1') {
          console.log('[EMAIL][TRY] port=%s attempt=%d to=%s subject="%s"', t.options.port, attempt+1, mailOptions.to, mailOptions.subject);
        }
        const result = await t.sendMail(mailOptions);
        if (process.env.DEBUG_EMAIL === '1') {
          console.log('[EMAIL][SUCCESS] port=%s messageId=%s', t.options.port, result.messageId);
        }
        return { success: true, transportPort: t.options.port, messageId: result.messageId };
      } catch (err) {
        lastErr = err;
        const code = err.code || 'UNKNOWN';
        const transient = TRANSIENT_CODES.has(code);
        console.error('[EMAIL][ERROR] port=%s attempt=%d code=%s transient=%s msg=%s', t.options.port, attempt+1, code, transient, err.message);
        if (!transient) break; // move to next transport
        attempt++;
        if (attempt > MAX_RETRIES) {
          console.error('[EMAIL][GIVEUP] port=%s after %d attempts', t.options.port, MAX_RETRIES+1);
          break; // try next transport
        }
        const backoff = 300 * attempt; // simple linear backoff
        await new Promise(r => setTimeout(r, backoff));
      }
    }
  }
  throw lastErr || new Error('Unknown email send failure');
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


// Simple test send via provider (Resend or SMTP) without exposing API key
module.exports.sendTestEmail = async (req, res) => {
  try {
    if (process.env.EMAIL_ENABLED === 'false') {
      return res.status(400).json({ error: 'Email disabled', EMAIL_ENABLED: process.env.EMAIL_ENABLED });
    }
    const to = req.query.to || process.env.TEST_EMAIL_TO || process.env.SMTP_USER;
    if (!to) {
      return res.status(400).json({ error: 'Target email (to) required via ?to=' });
    }
    const html = '<p>Test pengiriman email provider aktif. <strong>Musda Platform</strong>.</p>';
    const subject = 'Tes Provider Email - MUSDA';
    const mailOptions = { from: process.env.EMAIL_FROM || process.env.SMTP_USER, to, subject, html, attachments: [] };
    let result;
    if (process.env.EMAIL_PROVIDER === 'resend') {
      result = await sendEmailUnified(mailOptions);
    } else {
      result = await safeSendMail(mailOptions);
    }
    return res.json({ success: true, provider: result.provider || process.env.EMAIL_PROVIDER || 'smtp', messageId: result.id || result.messageId, to });
  } catch (e) {
    console.error('[EMAIL][TEST] Error:', e.message);
    return res.status(500).json({ error: 'Failed to send test email', message: e.message });
  }
};
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
    let ticketBuffer = null;
    try {
      await generateMusdaTicketPNG(qrPayload, guest, absTicketPath);
      ticketBuffer = fs.readFileSync(absTicketPath);
    } catch (genErr) {
      console.error('[EMAIL][TICKET] Failed to generate fancy ticket PNG, falling back to QR only:', genErr.message);
    }

    const attachments = [
      {
        filename: 'qrcode.png',
        content: qrBuffer,
        cid: 'qrcode@musda',
        contentType: 'image/png'
      },
      ...(ticketBuffer ? [{
        filename: fileName,
        content: ticketBuffer,
        cid: 'eticket@musda',
        contentType: 'image/png'
      }] : [])
    ];
    if (logoAttachment) attachments.push(logoAttachment);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: guest.email,
      subject: 'E-Tiket MUSDA II HIMPERRA Lampung - ' + guest.nama,
      html: emailHTML,
      attachments
    };
    if (process.env.DEBUG_EMAIL === '1') {
      console.log('[EMAIL][SEND] to=%s subject="%s" attachments=%d', mailOptions.to, mailOptions.subject, mailOptions.attachments.length);
    }
    let sendResult;
    if (process.env.EMAIL_PROVIDER === 'resend') {
      // Convert attachments for Resend (already handled in provider abstraction)
      sendResult = await sendEmailUnified(mailOptions);
      console.log(`📧 E-Tiket (Resend) berhasil dikirim ke ${guest.email}`);
    } else {
      sendResult = await safeSendMail(mailOptions);
      console.log(`📧 E-Tiket berhasil dikirim ke ${guest.email} via port ${sendResult.transportPort}`);
    }
    
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
    let ticketBuffer2 = null;
    try {
      await generateMusdaTicketPNG(qrPayload, guest, absTicketPath2);
      ticketBuffer2 = fs.readFileSync(absTicketPath2);
    } catch (genErr) {
      console.error('[EMAIL][TICKET] Fallback generation failure (utility path). Proceeding without main ticket:', genErr.message);
    }

    const attachments = [
      {
        filename: 'qrcode.png',
        content: qrBuffer,
        cid: 'qrcode@musda',
        contentType: 'image/png'
      },
      ...(ticketBuffer2 ? [{
        filename: fileName2,
        content: ticketBuffer2,
        cid: 'eticket@musda',
        contentType: 'image/png'
      }] : [])
    ];
    if (logoAttachment) attachments.push(logoAttachment);

    const mailOptions2 = {
      from: process.env.SMTP_USER,
      to: guest.email,
      subject: 'E-Tiket MUSDA II HIMPERRA Lampung - ' + guest.nama,
      html: emailHTML,
      attachments
    };
    if (process.env.DEBUG_EMAIL === '1') {
      console.log('[EMAIL][SEND] (utility) to=%s subject="%s" attachments=%d', mailOptions2.to, mailOptions2.subject, mailOptions2.attachments.length);
    }
    let result;
    if (process.env.EMAIL_PROVIDER === 'resend') {
      result = await sendEmailUnified(mailOptions2);
      console.log(`📧 E-Tiket (Resend) berhasil dikirim ke ${guest.email}`);
    } else {
      result = await safeSendMail(mailOptions2);
      console.log(`📧 E-Tiket berhasil dikirim ke ${guest.email} via port ${result.transportPort}`);
    }
    
    return { 
      success: true, 
      message: 'E-Tiket berhasil dikirim ke email',
      guest: guest.nama,
      email: guest.email,
      messageId: result.messageId,
      transportPort: result.transportPort
    };
    
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    if (process.env.DEBUG_EMAIL === '1') {
      console.error('[EMAIL][STACK]', error.stack);
      if (error.response) console.error('[EMAIL][SMTP RESPONSE]', error.response);
      if (error.code) console.error('[EMAIL][CODE]', error.code);
      console.error('[EMAIL][ENV SNAPSHOT]', {
        EMAIL_ENABLED: process.env.EMAIL_ENABLED,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_SECURE: process.env.SMTP_SECURE,
        SMTP_REQUIRE_TLS: process.env.SMTP_REQUIRE_TLS,
        SMTP_USER: process.env.SMTP_USER ? '[SET]' : '[MISSING]',
        SMTP_PASS: process.env.SMTP_PASS ? '[SET]' : '[MISSING]'
      });
    }
    throw error;
  }
};