const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { logoToBase64 } = require('./logoConverter');
const { getUploadsAbsPath } = require('./paths');

/**
 * Generate professional QR code with elegant template design
 * @param {string} data - Data to encode in QR code
 * @param {object} participant - Participant information
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} - Path to generated QR template
 */
async function generateQRTemplate(data, participant, outputPath) {
  try {
    // Canvas dimensions (optimized for mobile viewing and printing)
    const canvasWidth = 800;
    // Extra vertical space to avoid cropping
    const canvasHeight = 1400;

    // Create canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Color palette - MUSDA II Theme (Black & Gold)
    const colors = {
      primary: '#1a1a1a',
      secondary: '#2d2d2d',
      accent: '#d4af37',
      gold: '#f4d03f',
      white: '#ffffff',
      lightGray: '#f8f8f8',
      darkGray: '#333333',
      border: '#d4af37',
      success: '#2ecc71',
      warning: '#f39c12'
    };

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.3, colors.secondary);
    gradient.addColorStop(0.7, colors.secondary);
    gradient.addColorStop(1, colors.primary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Gold borders
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvasWidth - 8, canvasHeight - 8);
    ctx.strokeStyle = colors.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);

    // Header
    const headerHeight = 220;
    const headerGradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
    headerGradient.addColorStop(0, colors.secondary);
    headerGradient.addColorStop(0.5, colors.primary);
    headerGradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = headerGradient;
    ctx.fillRect(30, 30, canvasWidth - 60, headerHeight);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvasWidth - 60, headerHeight);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(30, headerHeight + 27, canvasWidth - 60, 6);

    // Logo
    const logoSize = 100;
    const logoX = 60;
    const logoY = 50;
    try {
      const logoBase64 = logoToBase64();
      if (logoBase64) {
        const logoData = logoBase64.replace(/^data:image\/\w+;base64,/, '');
        const logoBuffer = Buffer.from(logoData, 'base64');
        const tempLogoPath = path.join(__dirname, 'temp_logo.png');
        fs.writeFileSync(tempLogoPath, logoBuffer);
        const logoImg = await loadImage(tempLogoPath);
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.shadowBlur = 0;
        fs.unlinkSync(tempLogoPath);
      }
    } catch (e) {
      // Fallback box with SPH text
      ctx.fillStyle = colors.accent;
      ctx.fillRect(logoX, logoY, logoSize, logoSize);
      ctx.strokeStyle = colors.gold;
      ctx.lineWidth = 3;
      ctx.strokeRect(logoX, logoY, logoSize, logoSize);
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 32px "DejaVu Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPH', logoX + logoSize / 2, logoY + logoSize / 2 + 12);
    }

    // Titles
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 42px "DejaVu Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.fillText('E-TICKET SPH 2025', logoX + logoSize + 40, logoY + 50);
    ctx.font = '20px "DejaVu Sans", sans-serif';
    ctx.fillStyle = colors.white;
    ctx.shadowBlur = 2;
    ctx.fillText('Sekolah Properti Himperra', logoX + logoSize + 40, logoY + 80);
    ctx.font = '16px "DejaVu Sans", sans-serif';
    ctx.fillStyle = colors.lightGray;
    ctx.shadowBlur = 1;
    ctx.fillText('HIMPERRA LAMPUNG', logoX + logoSize + 40, logoY + 105);
    ctx.shadowBlur = 0;

    // Participant info box
    const infoY = headerHeight + 70;
    const infoHeight = 200;
    const infoGradient = ctx.createLinearGradient(0, infoY, 0, infoY + infoHeight);
    infoGradient.addColorStop(0, colors.darkGray);
    infoGradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = infoGradient;
    ctx.fillRect(50, infoY, canvasWidth - 100, infoHeight);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(50, infoY, canvasWidth - 100, infoHeight);

    ctx.fillStyle = colors.white;
    ctx.font = 'bold 28px "DejaVu Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 2;
    ctx.fillText('Selamat Datang', canvasWidth / 2, infoY + 40);
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 32px "DejaVu Sans", sans-serif';
    ctx.shadowBlur = 3;
    ctx.fillText(`${participant.nama || participant.full_name}`, canvasWidth / 2, infoY + 80);
    ctx.font = '18px "DejaVu Sans", sans-serif';
    ctx.fillStyle = colors.lightGray;
    ctx.shadowBlur = 1;
    ctx.fillText(participant.instansi || participant.institution || 'Peserta SPH', canvasWidth / 2, infoY + 110);
    ctx.fillText(participant.email, canvasWidth / 2, infoY + 135);

    // Ticket number badge
    const ticketText = `Ticket #${participant.id.toString().padStart(4, '0')}`;
    ctx.fillStyle = colors.accent;
    const ticketWidth = 180;
    const ticketHeight = 30;
    ctx.fillRect(canvasWidth / 2 - ticketWidth / 2, infoY + 150, ticketWidth, ticketHeight);
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 16px "DejaVu Sans", sans-serif';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.fillText(ticketText, canvasWidth / 2, infoY + 170);

    // Payment status badge
    const isPaid = (participant.payment_status || '').toLowerCase() === 'paid';
    const statusLabel = isPaid ? 'STATUS: LUNAS (PAID)' : `STATUS: ${(participant.payment_status || 'PENDING').toUpperCase()}`;
    const statusY = infoY + infoHeight + 20;
    const statusPaddingX = 18;
    const statusBoxHeight = 34;
    ctx.font = 'bold 18px "DejaVu Sans", sans-serif';
    const statusTextWidth = ctx.measureText(statusLabel).width;
    const statusBoxWidth = statusTextWidth + statusPaddingX * 2;
    const statusX = (canvasWidth - statusBoxWidth) / 2;
    ctx.fillStyle = isPaid ? colors.success : colors.warning;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const r = 10;
    ctx.moveTo(statusX + r, statusY);
    ctx.lineTo(statusX + statusBoxWidth - r, statusY);
    ctx.quadraticCurveTo(statusX + statusBoxWidth, statusY, statusX + statusBoxWidth, statusY + r);
    ctx.lineTo(statusX + statusBoxWidth, statusY + statusBoxHeight - r);
    ctx.quadraticCurveTo(statusX + statusBoxWidth, statusY + statusBoxHeight, statusX + statusBoxWidth - r, statusY + statusBoxHeight);
    ctx.lineTo(statusX + r, statusY + statusBoxHeight);
    ctx.quadraticCurveTo(statusX, statusY + statusBoxHeight, statusX, statusY + statusBoxHeight - r);
    ctx.lineTo(statusX, statusY + r);
    ctx.quadraticCurveTo(statusX, statusY, statusX + r, statusY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.white;
    ctx.textAlign = 'center';
    ctx.fillText(statusLabel, statusX + statusBoxWidth / 2, statusY + statusBoxHeight / 2 + 6);

    // QR Code section
    const qrY = infoY + infoHeight + 60;
    const qrSize = 320;
    const qrX = (canvasWidth - qrSize) / 2;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = colors.white;
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    ctx.strokeStyle = colors.white;
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX + 3, qrY + 3, qrSize - 6, qrSize - 6);
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: qrSize - 60,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    });
    const qrImg = await loadImage(qrCodeDataURL);
    ctx.drawImage(qrImg, qrX + 30, qrY + 30, qrSize - 60, qrSize - 60);

    // QR label
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 24px "DejaVu Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 3;
    ctx.fillText('Scan QR Code untuk Check-in', canvasWidth / 2, qrY + qrSize + 50);
    ctx.font = '16px "DejaVu Sans", sans-serif';
    ctx.fillStyle = colors.white;
    ctx.shadowBlur = 2;
    ctx.fillText('Tunjukkan QR ini saat registrasi di lokasi acara', canvasWidth / 2, qrY + qrSize + 80);
    ctx.shadowBlur = 0;

    // Instructions
    const instructY = qrY + qrSize + 130;
    const instructionBoxHeight = 220;
    const instrGradient = ctx.createLinearGradient(0, instructY, 0, instructY + instructionBoxHeight);
    instrGradient.addColorStop(0, colors.secondary);
    instrGradient.addColorStop(1, colors.darkGray);
    ctx.fillStyle = instrGradient;
    ctx.fillRect(50, instructY, canvasWidth - 100, instructionBoxHeight);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(50, instructY, canvasWidth - 100, instructionBoxHeight);
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 20px "DejaVu Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 2;
    ctx.fillText('Informasi Penting SPH 2025', 70, instructY + 35);
    const instructions = [
      '- Harap datang 30 menit sebelum acara dimulai',
      '- Bawa identitas diri yang valid (KTP/Kartu Mahasiswa)',
      '- Simpan e-ticket ini dengan baik di smartphone',
      '- QR code akan dipindai saat check-in',
      '- Siapkan alat tulis untuk materi pembelajaran'
    ];
    ctx.font = '16px "DejaVu Sans", sans-serif';
    ctx.fillStyle = colors.white;
    ctx.shadowBlur = 1;
    instructions.forEach((instruction, index) => {
      ctx.fillText(instruction, 80, instructY + 70 + index * 26);
    });
    ctx.shadowBlur = 0;

    // Footer
    const footerMinTop = instructY + instructionBoxHeight + 60;
    const footerY = Math.max(canvasHeight - 120, footerMinTop);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(30, footerY - 20, canvasWidth - 60, 80);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(30, footerY - 20, canvasWidth - 60, 80);
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 20px "DejaVu Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 2;
    ctx.fillText('MUSDA II HIMPERRA LAMPUNG', canvasWidth / 2, footerY + 5);
    ctx.font = '14px "DejaVu Sans", sans-serif';
    ctx.fillStyle = colors.white;
    ctx.shadowBlur = 1;
    ctx.fillText('Sekolah Properti Himperra', canvasWidth / 2, footerY + 25);
    ctx.font = '12px "DejaVu Sans", sans-serif';
    ctx.fillStyle = colors.lightGray;
    ctx.fillText('© 2025 SPH - Himpunan Pengembang Perumahan dan Permukiman Rakyat Daerah Lampung', canvasWidth / 2, footerY + 45);
    ctx.shadowBlur = 0;

    // Decorations
    ctx.fillStyle = colors.gold;
    ctx.beginPath();
    ctx.arc(canvasWidth - 30, 30, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(30, canvasHeight - 30, 15, 0, Math.PI * 2);
    ctx.fill();

    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Professional QR template generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Error generating QR template:', error);
    throw error;
  }
}

module.exports = { generateQRTemplate };