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
    pass: process.env.SMTP_PASS
  }
});

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
    // ...existing code...
  // Maksimalkan kualitas dan layout dengan canvas besar
  const width = 800, height = 1600;
  // Generate QR code PNG dengan resolusi tinggi
  const qrBuffer = await QRCode.toBuffer(id.toString(), { type: 'png', width: 320 });
  // Load logo Himperra dan Musda
  const logoHimperraPath = 'c:/xampp/htdocs/MUSDA/frontend/public/images/logo-himperra.png';
  const logoMusdaPath = 'c:/xampp/htdocs/MUSDA/frontend/public/images/logo-musda.png';
  const logoHimperra = await loadImage(logoHimperraPath);
  const logoMusda = await loadImage(logoMusdaPath);
  // Create e-ticket canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  // Gradasi background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#181830');
  grad.addColorStop(0.5, '#23234a');
  grad.addColorStop(1, '#181830');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  // Border emas
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 16;
  ctx.strokeRect(40, 40, width-80, height-80);
  // Logo Himperra di tengah atas dengan shadow
  ctx.save();
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 32;
  ctx.drawImage(logoHimperra, width/2-50, 60, 100, 100);
  ctx.restore();
  // QR dengan shadow/glow
  const qrImg = await loadImage(qrBuffer);
  ctx.save();
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 24;
  ctx.drawImage(qrImg, width/2-120, 220, 240, 240);
  ctx.restore();
  // Title
  ctx.font = `bold 60px Segoe UI`;
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  ctx.fillText('E-Ticket MUSDA II', width/2, 520);
  ctx.font = `bold 40px Segoe UI`;
  ctx.fillStyle = '#fff';
  ctx.fillText('HIMPERRA Lampung 2025', width/2, 570);
  ctx.font = `30px Segoe UI`;
  ctx.fillStyle = '#FFD700';
  ctx.fillText('Tiket Resmi - Jangan Hilangkan', width/2, 610);
  // Info box
  ctx.fillStyle = '#23234a';
  ctx.fillRect(120, 650, width-240, 200);
  let yInfo = 700;
  // Hilangkan badge kategori di pojok atas
      ctx.font = `bold 38px Segoe UI`;
      // Info tamu dengan border antar baris
      const infoItems = [
        { text: guest.nama, font: 'bold 38px Segoe UI', color: '#FFD700' },
        { text: guest.instansi, font: '28px Segoe UI', color: '#fff' },
        { text: guest.position, font: '24px Segoe UI', color: '#fff' },
        { text: guest.email, font: '22px Segoe UI', color: '#FFD700' },
        { text: guest.whatsapp, font: '22px Segoe UI', color: '#fff' },
        { text: `Tanggal Daftar: ${(() => { let t = guest.booking_date; try { t = new Date(t).toISOString().slice(0, 10); } catch {} return t; })()}`, font: '22px Segoe UI', color: '#FFD700' }
      ];
      let infoY = 670;
      for (let i = 0; i < infoItems.length; i++) {
        const item = infoItems[i];
        ctx.font = item.font;
        ctx.fillStyle = item.color;
        ctx.textAlign = 'center';
        ctx.fillText(item.text, width/2, infoY);
        // Border antar baris
        if (i < infoItems.length - 1) {
          ctx.strokeStyle = '#FFD70044';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(width/2-180, infoY+12);
          ctx.lineTo(width/2+180, infoY+12);
          ctx.stroke();
        }
        infoY += 36;
      }
      // Kategori & Kota
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(120, 870, 220, 70);
      ctx.fillRect(width-340, 870, 220, 70);
      ctx.fillStyle = '#23234a';
      ctx.font = `bold 28px Segoe UI`;
      ctx.fillText('Kategori', 230, 900);
      ctx.font = `24px Segoe UI`;
      ctx.fillText(guest.category, 230, 930);
      ctx.font = `bold 28px Segoe UI`;
      ctx.fillText('Kota', width-230, 900);
      ctx.font = `24px Segoe UI`;
      ctx.fillText(guest.city, width-230, 930);
      // Status
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(120, 970, width-240, 70);
      ctx.font = `bold 32px Segoe UI`;
      ctx.fillStyle = '#fff';
      ctx.fillText('Registrasi Berhasil', width/2, 1020);
  // Branding
  ctx.font = `24px Segoe UI`;
  ctx.fillStyle = '#FFD700';
  ctx.fillText('MUSDA II HIMPERRA Lampung 2025', width/2, 1100);
  ctx.font = `24px Segoe UI`;
  ctx.fillStyle = '#fff';
  ctx.fillText('musda.himperra-lampung.com', width/2, 1130);
  // Logo Musda (gajah) di bagian bawah tengah, 3x lipat lebih besar dengan shadow
  ctx.save();
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 32;
  ctx.drawImage(logoMusda, width/2-150, 1150, 300, 300);
  ctx.restore();
  // Footer kontak & CTA scan QR
  ctx.font = `22px Segoe UI`;
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  ctx.fillText('Scan QR di atas untuk validasi kehadiran', width/2, 1480);
  ctx.font = `18px Segoe UI`;
  ctx.fillStyle = '#fff';
  ctx.fillText('Info & Bantuan: 0812-3456-7890', width/2, 1510);
  // Save PNG (resize ke 430x866 agar attachment tidak terlalu besar tapi tetap tajam)
  const { createCanvas: createCanvasSmall } = require('canvas');
  const canvasSmall = createCanvasSmall(430, 866);
  const ctxSmall = canvasSmall.getContext('2d');
  ctxSmall.drawImage(canvas, 0, 0, 430, 866);
  const ticketBuffer = canvasSmall.toBuffer('image/png');
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: guest.email,
        subject: 'E-Tiket MUSDA II HIMPERRA Lampung',
        html: `
          <div style="max-width:480px;margin:auto;background:#fff;border-radius:18px;padding:36px 28px;font-family:'Segoe UI',sans-serif;box-shadow:0 4px 24px #0001;">
            <div style="text-align:center;margin-bottom:24px;">
              <img src="https://musda.himperra-lampung.com/images/logo-himperra.png" alt="Logo Himperra" style="height:60px;margin-bottom:10px;" />
              <h2 style="color:#222;font-size:2rem;margin:0 0 10px 0;font-weight:700;letter-spacing:1px;">E-Tiket MUSDA II</h2>
              <div style="color:#555;font-size:1.15rem;font-weight:500;margin-bottom:4px;">HIMPERRA Lampung 2025</div>
              <div style="color:#888;font-size:1rem;margin-bottom:14px;">Tiket Resmi - Jangan Hilangkan</div>
            </div>
            <div style="background:#f3f4f6;border-radius:14px;padding:18px 14px;text-align:left;margin-bottom:22px;">
              <div style="font-size:1.25rem;color:#222;font-weight:700;margin-bottom:6px;text-align:center;">Halo, ${guest.nama}!</div>
              <div style="font-size:1.05rem;color:#555;margin-bottom:2px;text-align:center;">${guest.instansi}</div>
              <div style="font-size:1rem;color:#888;margin-bottom:2px;text-align:center;">${guest.position}</div>
              <div style="font-size:0.98rem;color:#0369a1;margin-bottom:2px;text-align:center;">${guest.email}</div>
              <div style="font-size:0.98rem;color:#888;margin-bottom:2px;text-align:center;">${guest.whatsapp}</div>
              <div style="font-size:0.98rem;color:#888;margin-bottom:2px;text-align:center;">Tanggal Booking: <b>${guest.booking_date}</b></div>
            </div>
            <div style="display:flex;flex-direction:row;justify-content:center;align-items:center;gap:18px;margin-bottom:22px;">
              <div style="background:#fef3c7;border-radius:8px;padding:10px 18px;text-align:center;color:#b45309;font-size:1rem;font-weight:500;min-width:100px;">Kategori<br /><span style="color:#222;font-weight:600;">${guest.category}</span></div>
              <div style="background:#e0f2fe;border-radius:8px;padding:10px 18px;text-align:center;color:#0369a1;font-size:1rem;font-weight:500;min-width:100px;">Kota<br /><span style="color:#222;font-weight:600;">${guest.city}</span></div>
            </div>
            <div style="background:#dcfce7;border-radius:8px;padding:14px;text-align:center;color:#16a34a;font-size:1.15rem;font-weight:700;margin-bottom:14px;">Registrasi Berhasil</div>
            <div style="text-align:center;margin-bottom:18px;">
              <b>Preview E-Tiket Anda:</b><br />
              <img src="cid:eticketpreview" alt="E-Tiket Preview" style="width:220px;border-radius:12px;box-shadow:0 2px 12px #0002;margin:12px auto;display:block;" />
            </div>
            <div style="text-align:center;margin-bottom:18px;">
              <a href="https://musda.himperra-lampung.com" style="background:#FFD700;color:#23234a;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:1.1rem;box-shadow:0 2px 8px #FFD70044;">Download E-Tiket PNG</a>
            </div>
            <div style="text-align:center;color:#888;font-size:1rem;margin-top:18px;line-height:1.5;">
              <b>Scan QR pada e-ticket untuk validasi kehadiran di lokasi acara.</b><br />
              MUSDA II HIMPERRA Lampung 2025<br />
              <a href="https://musda.himperra-lampung.com" style="color:#0369a1;text-decoration:none;font-weight:500;">musda.himperra-lampung.com</a><br />
              Info & Bantuan: <a href="tel:081234567890" style="color:#0369a1;text-decoration:none;">0812-3456-7890</a>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `E-Tiket-MUSDA-${guest.nama}.png`,
            content: ticketBuffer,
            contentType: 'image/png',
            cid: 'eticketpreview'
          }
        ]
      };
      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (e) {
      // Logging error detail ke console dan file
      const fs = require('fs');
      const logMsg = `[${new Date().toISOString()}] Email send error: ${e.message}\n${e.response || ''}\n${e.stack || ''}\n`;
      fs.appendFileSync('email_error.log', logMsg);
      res.status(500).json({
        error: 'Gagal kirim email',
        detail: e.message,
        response: e.response || null,
        stack: e.stack || null
      });
  }
};
