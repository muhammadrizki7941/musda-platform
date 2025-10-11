require('dotenv').config();
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

async function testEmail() {
  console.log('🔍 Testing email configuration...');
  
  // Test SMTP connection
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    // Test connection
    console.log('📡 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Generate test QR code
    const testQR = await QRCode.toDataURL('TEST-MUSDA-EMAIL-123');
    
    // Test email content
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Test E-Tiket MUSDA II HIMPERRA Lampung</h2>
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Test Email Configuration:</h3>
          <p><strong>Status:</strong> Email sending system working!</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('id-ID')}</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${testQR}" alt="Test QR Code" style="width: 200px; height: 200px;"/>
          <p style="color: #4a5568; margin-top: 10px;">Test QR Code</p>
        </div>
      </div>
    `;

    // Send test email
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: 'Test E-Tiket MUSDA II HIMPERRA Lampung',
      html: emailHTML
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('📧 Sent to:', process.env.SMTP_USER);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Details:', error);
  }
}

testEmail();