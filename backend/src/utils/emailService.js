const nodemailer = require('nodemailer');
const fs = require('fs');

class EmailService {
  constructor() {
    // Fix: should be createTransport (not createTransporter)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    if (process.env.DEBUG_EMAIL === '1') {
      console.log('[EMAIL] Transporter initialized with host=%s port=%s user=%s', process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER);
      this.transporter.verify().then(()=>{
        console.log('[EMAIL] Transporter verification success');
      }).catch(err=>{
        console.error('[EMAIL] Transporter verification failed:', err.message);
      });
    }
  }

  async sendTicketEmail(participant, ticketFile) {
    try {
      // Generate QR code PNG file
      const QRCode = require('qrcode');
      const path = require('path');
      const fs = require('fs');
      const qrData = JSON.stringify({
        participantId: participant.id,
        nama: participant.nama,
        email: participant.email,
        eventCode: 'SEKOLAH-PROPERTI-2025'
      });
      const qrPngPath = path.join(__dirname, '../../uploads/tickets', `qr-${participant.id}-${Date.now()}.png`);
      await QRCode.toFile(qrPngPath, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const mailOptions = {
        from: {
          name: 'HIMPERRA Lampung',
          address: process.env.SMTP_FROM || 'dpdhimperralampung@gmail.com'
        },
        to: participant.email,
        subject: 'E-Tiket Sekolah Properti HIMPERRA Lampung',
        html: this.generateTicketEmailTemplate(participant),
        attachments: [
          {
            filename: `E-Tiket-${participant.nama.replace(/\s+/g, '-')}.pdf`,
            path: ticketFile.filepath,
            contentType: 'application/pdf'
          },
          {
            filename: `QR-Code-${participant.nama.replace(/\s+/g, '-')}.png`,
            path: qrPngPath,
            contentType: 'image/png'
          }
        ]
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      // Optional: Clean up QR PNG file after sending
      setTimeout(() => {
        try { if (fs.existsSync(qrPngPath)) fs.unlinkSync(qrPngPath); } catch {}
      }, 10000);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPaymentConfirmation(participant) {
    try {
      const mailOptions = {
        from: {
          name: 'HIMPERRA Lampung',
          address: process.env.SMTP_FROM || 'dpdhimperralampung@gmail.com'
        },
        to: participant.email,
        subject: 'Konfirmasi Pembayaran - Sekolah Properti HIMPERRA Lampung',
        html: this.generatePaymentConfirmationTemplate(participant)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Payment confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw new Error('Failed to send payment confirmation');
    }
  }

  generateTicketEmailTemplate(participant) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2C5530 0%, #1F4E23 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; background: #2C5530; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .event-details { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Selamat!</h1>
                <p>Pembayaran Anda telah berhasil dikonfirmasi</p>
            </div>
            
            <div class="content">
                <p>Halo <strong>${participant.nama}</strong>,</p>
                
                <p>Terima kasih telah mendaftar di <strong>Sekolah Properti HIMPERRA Lampung</strong>. Pembayaran Anda telah kami terima dan e-tiket telah terlampir pada email ini.</p>
                
                <div class="event-details">
                    <h3>Detail Acara:</h3>
                    <p><strong>📅 Tanggal:</strong> 15 November 2025</p>
                    <p><strong>⏰ Waktu:</strong> 08:00 - 17:00 WIB</p>
                    <p><strong>📍 Lokasi:</strong> Hotel Radisson Bandar Lampung</p>
                    <p><strong>💳 Kode Pembayaran:</strong> ${participant.paymentCode}</p>
                    <p><strong>👤 Kategori:</strong> ${participant.kategori === 'mahasiswa' ? 'Mahasiswa' : 'Umum'}</p>
                    <p><strong>🏢 Asal:</strong> ${participant.asal_instansi}</p>
                    <p><strong>💰 Biaya:</strong> Rp ${participant.amount ? participant.amount.toLocaleString('id-ID') : '150.000'}</p>
                </div>
                
                <div class="highlight">
                    <h4>Yang Perlu Dipersiapkan:</h4>
                    <ul>
                        <li>Tunjukkan e-tiket atau QR code saat check-in</li>
                        <li>Bawa identitas diri (KTP/SIM)</li>
                        <li>Hadir 30 menit sebelum acara dimulai</li>
                        <li>Berpakaian rapi (kemeja/blouse, celana panjang)</li>
                    </ul>
                </div>
                
                <p><strong>Materi yang akan dipelajari:</strong></p>
                <ul>
                    <li>Dasar-dasar Investasi Properti</li>
                    <li>Analisa Lokasi dan Market</li>
                    <li>Strategi Pembiayaan</li>
                    <li>Legal dan Perizinan</li>
                    <li>Networking Session</li>
                </ul>
                
                <p>Jika ada pertanyaan, silakan hubungi kami:</p>
                <p>📧 Email: dpdhimperralampung@gmail.com</p>
                <p>📱 WhatsApp: 0812-3456-7890</p>
            </div>
            
            <div class="footer">
                <p>Email ini dikirim otomatis oleh sistem MUSDA II HIMPERRA Lampung</p>
                <p>© 2025 HIMPERRA Lampung. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generatePaymentConfirmationTemplate(participant) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2C5530 0%, #1F4E23 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Pembayaran Diterima</h1>
                <p>Pendaftaran Sekolah Properti HIMPERRA Lampung</p>
            </div>
            
            <div class="content">
                <p>Halo <strong>${participant.nama}</strong>,</p>
                
                <p>Terima kasih! Kami telah menerima pembayaran Anda untuk Sekolah Properti HIMPERRA Lampung.</p>
                
                <div class="highlight">
                    <p><strong>Status:</strong> Pembayaran dikonfirmasi ✅</p>
                    <p><strong>Kode Pembayaran:</strong> ${participant.paymentCode}</p>
                    <p><strong>Metode:</strong> ${participant.paymentMethod === 'qris' ? 'QRIS' : 'Transfer Manual'}</p>
                </div>
                
                <p>E-tiket akan segera dikirimkan ke email ini dalam beberapa menit. Jika tidak menerima e-tiket dalam 15 menit, silakan hubungi kami.</p>
                
                <p>Terima kasih atas kepercayaan Anda!</p>
                
                <hr>
                <p><small>Tim HIMPERRA Lampung</small></p>
            </div>
            
            <div class="footer">
                <p>Email ini dikirim otomatis oleh sistem MUSDA II HIMPERRA Lampung</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = EmailService;