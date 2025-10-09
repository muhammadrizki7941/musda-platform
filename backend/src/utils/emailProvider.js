const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const path = require('path');

// This module provides a unified sendEmail interface.
// Priority: RESEND (if EMAIL_PROVIDER=resend & API key present) -> fallback SMTP (single transport)

let resendClient = null;
if (process.env.EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY) {
  try {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    if (process.env.DEBUG_EMAIL === '1') {
      console.log('[EMAIL][PROVIDER] Resend client initialized');
    }
  } catch (e) {
    console.error('[EMAIL][PROVIDER] Failed to init Resend:', e.message);
  }
}

// Minimal SMTP fallback (not multi-port; we reuse environment). For robust logic rely on emailController safeSendMail.
let fallbackTransport = null;
if (!resendClient && process.env.EMAIL_ENABLED !== 'false') {
  try {
    fallbackTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '587',10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (err) {
    console.error('[EMAIL][PROVIDER] Fallback SMTP init error:', err.message);
  }
}

async function sendViaResend({ from, to, subject, html, attachments }) {
  if (!resendClient) throw new Error('Resend client not initialized');
  // Resend expects attachments as array of { filename, content } with base64 string or Buffer
  const files = (attachments || []).map(a => {
    let contentBase64;
    if (Buffer.isBuffer(a.content)) {
      contentBase64 = a.content.toString('base64');
    } else if (typeof a.content === 'string') {
      // assume already base64 or raw text
      contentBase64 = Buffer.from(a.content).toString('base64');
    } else {
      contentBase64 = '';
    }
    return {
      filename: a.filename,
      content: contentBase64,
      path: a.path,
      // Resend uses content property; contentType currently optional
    };
  });
  const mail = {
    from: from || process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments: files
  };
  if (process.env.DEBUG_EMAIL === '1') {
    console.log('[EMAIL][RESEND][SEND] to=%s subject="%s" files=%d', to, subject, files.length);
  }
  const result = await resendClient.emails.send(mail);
  if (process.env.DEBUG_EMAIL === '1') {
    console.log('[EMAIL][RESEND][RESULT]', result);
  }
  return { provider: 'resend', id: result.id || result.messageId || 'unknown' };
}

async function sendViaSMTP({ from, to, subject, html, attachments }) {
  if (!fallbackTransport) throw new Error('SMTP fallback not initialized');
  const mailOptions = {
    from: from || process.env.SMTP_USER,
    to,
    subject,
    html,
    attachments
  };
  const result = await fallbackTransport.sendMail(mailOptions);
  return { provider: 'smtp', id: result.messageId };
}

async function sendEmailUnified(opts) {
  if (resendClient) {
    try {
      return await sendViaResend(opts);
    } catch (e) {
      console.error('[EMAIL][RESEND] Failed, switching to SMTP fallback:', e.message);
    }
  }
  return await sendViaSMTP(opts);
}

module.exports = {
  sendEmailUnified
};