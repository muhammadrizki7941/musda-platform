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
  // Tambahkan ruang vertikal ekstra agar desain tidak terpotong saat diunduh
  const canvasHeight = 1400;
    
    // Create canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    
    // Color palette - MUSDA II Theme (Black & Gold)
    const colors = {
      primary: '#1a1a1a',      // Deep black
      secondary: '#2d2d2d',    // Dark gray
      accent: '#d4af37',       // Gold accent (like MUSDA II)
      gold: '#f4d03f',         // Bright gold
      white: '#ffffff',
      lightGray: '#f8f8f8',
      darkGray: '#333333',
      border: '#d4af37',       // Gold border
      success: '#2ecc71',      // Success green
      warning: '#f39c12'       // Warning orange
    };
    
    // Background with elegant dark gradient (MUSDA II style)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.3, colors.secondary);
    gradient.addColorStop(0.7, colors.secondary);
    gradient.addColorStop(1, colors.primary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Gold border frame
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvasWidth - 8, canvasHeight - 8);
    
    // Inner gold accent border
    ctx.strokeStyle = colors.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvasWidth - 40, canvasHeight - 40);
    
    // Header section with MUSDA II elegant design
    const headerHeight = 220;
    const headerGradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
    headerGradient.addColorStop(0, colors.secondary);
    headerGradient.addColorStop(0.5, colors.primary);
    headerGradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = headerGradient;
    ctx.fillRect(30, 30, canvasWidth - 60, headerHeight);
    
    // Gold header border
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvasWidth - 60, headerHeight);
    
    // Header decorative gold line
    ctx.fillStyle = colors.accent;
    ctx.fillRect(30, headerHeight + 27, canvasWidth - 60, 6);
    
    // SPH Logo area (if available) - NO CIRCLE WRAPPER
    const logoSize = 100;
    const logoX = 60;
    const logoY = 50;
    
    try {
      const logoBase64 = logoToBase64();
      if (logoBase64) {
        // Convert base64 to buffer and load as image
        const logoData = logoBase64.replace(/^data:image\/\w+;base64,/, '');
        const logoBuffer = Buffer.from(logoData, 'base64');
        
        // Save temporary logo file
  const tempLogoPath = path.join(__dirname, 'temp_logo.png');
        fs.writeFileSync(tempLogoPath, logoBuffer);
        
        const logoImg = await loadImage(tempLogoPath);
        
        // Draw logo UTUH tanpa circle wrapper, dengan gold shadow
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.shadowBlur = 0; // Reset shadow
        
        // Clean up temp file
        fs.unlinkSync(tempLogoPath);
      }
    } catch (error) {
      console.log('Logo loading failed, using gold text fallback');
      // Fallback: SPH text logo with MUSDA II style
      ctx.fillStyle = colors.accent;
      ctx.fillRect(logoX, logoY, logoSize, logoSize);
      ctx.strokeStyle = colors.gold;
      ctx.lineWidth = 3;
      ctx.strokeRect(logoX, logoY, logoSize, logoSize);
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 32px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('SPH', logoX + logoSize/2, logoY + logoSize/2 + 12);
    }
    
  // Title text - MUSDA II Style (use widely-available sans font)
  ctx.fillStyle = colors.accent; // Gold color
  ctx.font = 'bold 42px DejaVu Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    ctx.fillText('E-TICKET SPH 2025', logoX + logoSize + 40, logoY + 50);
    
  ctx.font = '20px DejaVu Sans, sans-serif';
    ctx.fillStyle = colors.white;
    ctx.shadowBlur = 2;
    ctx.fillText('Sekolah Properti Himperra', logoX + logoSize + 40, logoY + 80);
    
  ctx.font = '16px DejaVu Sans, sans-serif';
    ctx.fillStyle = colors.lightGray;
    ctx.shadowBlur = 1;
    ctx.fillText('HIMPERRA LAMPUNG', logoX + logoSize + 40, logoY + 105);
    ctx.shadowBlur = 0; // Reset shadow
    
    // Participant info section - MUSDA II Dark Theme
    const infoY = headerHeight + 70;
    const infoHeight = 200;
    
    // Info background with gold border and dark theme
    const infoGradient = ctx.createLinearGradient(0, infoY, 0, infoY + infoHeight);
    infoGradient.addColorStop(0, colors.darkGray);
    infoGradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = infoGradient;
    ctx.fillRect(50, infoY, canvasWidth - 100, infoHeight);
    
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(50, infoY, canvasWidth - 100, infoHeight);
    
    // Participant info with gold text
  ctx.fillStyle = colors.white;
  ctx.font = 'bold 28px DejaVu Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 2;
    ctx.fillText('Selamat Datang', canvasWidth/2, infoY + 40);
    
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 32px DejaVu Sans, sans-serif';
    ctx.shadowBlur = 3;
    ctx.fillText(`${participant.nama || participant.full_name}`, canvasWidth/2, infoY + 80);
    
  ctx.font = '18px DejaVu Sans, sans-serif';
    ctx.fillStyle = colors.lightGray;
    ctx.shadowBlur = 1;
    ctx.fillText(participant.instansi || participant.institution || 'Peserta SPH', canvasWidth/2, infoY + 110);
    ctx.fillText(participant.email, canvasWidth/2, infoY + 135);
    
  // Ticket number with gold background
    const ticketText = `Ticket #${participant.id.toString().padStart(4, '0')}`;
    ctx.fillStyle = colors.accent;
    const ticketWidth = 180;
    const ticketHeight = 30;
    ctx.fillRect(canvasWidth/2 - ticketWidth/2, infoY + 150, ticketWidth, ticketHeight);
    ctx.fillStyle = colors.primary;
  ctx.font = 'bold 16px DejaVu Sans, sans-serif';
    ctx.shadowBlur = 0;
    ctx.fillText(ticketText, canvasWidth/2, infoY + 170);

  // Payment status badge (only meaningful when downloaded after paid)
  const isPaid = (participant.payment_status || '').toLowerCase() === 'paid';
  const statusLabel = isPaid ? 'STATUS: LUNAS (PAID)' : `STATUS: ${(participant.payment_status || 'PENDING').toUpperCase()}`;
  const statusY = infoY + infoHeight + 20; // ditempatkan di antara info box dan QR
  const statusPaddingX = 18;
  const statusPaddingY = 8;
  ctx.font = 'bold 18px DejaVu Sans, sans-serif';
  const statusTextWidth = ctx.measureText(statusLabel).width;
  const statusBoxWidth = statusTextWidth + statusPaddingX * 2;
  const statusBoxHeight = 34;
  const statusX = (canvasWidth - statusBoxWidth) / 2;
  // Badge background
  ctx.fillStyle = isPaid ? colors.success : colors.warning;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const r = 10; // rounded corners
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
  // Badge text
  ctx.fillStyle = colors.white;
  ctx.textAlign = 'center';
  ctx.fillText(statusLabel, statusX + statusBoxWidth / 2, statusY + statusBoxHeight / 2 + 6);
    
    // QR Code section - MUSDA II Dark Theme
  const qrY = infoY + infoHeight + 50 + 10; // tambah sedikit jarak setelah badge status
    const qrSize = 320;
    const qrX = (canvasWidth - qrSize) / 2;
    
    // QR Code background with elegant gold shadow
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = colors.white;
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.shadowBlur = 0; // Reset shadow
    
    // Gold border for QR
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    
    // Inner white border
    ctx.strokeStyle = colors.white;
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX + 3, qrY + 3, qrSize - 6, qrSize - 6);
    
    // Generate QR code with high contrast
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: qrSize - 60,
      margin: 0,
      color: {
        dark: '#000000',  // Pure black for better scanning
        light: '#ffffff'  // Pure white
      },
      errorCorrectionLevel: 'M'
    });
    
    // Load and draw QR code
    const qrImg = await loadImage(qrCodeDataURL);
    ctx.drawImage(qrImg, qrX + 30, qrY + 30, qrSize - 60, qrSize - 60);
    
    // QR Code label with MUSDA II style
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 24px DejaVu Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 3;
  // Avoid emojis to prevent missing glyphs in minimal servers
  ctx.fillText('Scan QR Code untuk Check-in', canvasWidth/2, qrY + qrSize + 50);
    
  ctx.font = '16px DejaVu Sans, sans-serif';
    ctx.fillStyle = colors.white;
    ctx.shadowBlur = 2;
    ctx.fillText('Tunjukkan QR ini saat registrasi di lokasi acara', canvasWidth/2, qrY + qrSize + 80);
    ctx.shadowBlur = 0; // Reset shadow
    
    // Instructions section - MUSDA II Dark Theme
    const instructY = qrY + qrSize + 130;
    
    // Dark background with gold border
  const instructionBoxHeight = 220; // beri ruang lebih agar tidak mepet footer
  const instrGradient = ctx.createLinearGradient(0, instructY, 0, instructY + instructionBoxHeight);
    instrGradient.addColorStop(0, colors.secondary);
    instrGradient.addColorStop(1, colors.darkGray);
    ctx.fillStyle = instrGradient;
  ctx.fillRect(50, instructY, canvasWidth - 100, instructionBoxHeight);
    
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
  ctx.strokeRect(50, instructY, canvasWidth - 100, instructionBoxHeight);
    
    // Instructions title
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 20px DejaVu Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 2;
    ctx.fillText('📋 Informasi Penting SPH 2025', 70, instructY + 35);
    
    // Instructions list with gold bullets
    const instructions = [
      '• Harap datang 30 menit sebelum acara dimulai',
      '• Bawa identitas diri yang valid (KTP/Kartu Mahasiswa)', 
      '• Simpan e-ticket ini dengan baik di smartphone',
      '• QR code akan dipindai saat check-in',
      '• Siapkan alat tulis untuk materi pembelajaran'
    ];
    
    ctx.font = '16px DejaVu Sans, sans-serif';
    ctx.fillStyle = colors.white;
    ctx.shadowBlur = 1;
    instructions.forEach((instruction, index) => {
      ctx.fillText(instruction, 80, instructY + 70 + (index * 26));
    });
    ctx.shadowBlur = 0;
    
  // Footer - MUSDA II Style
  // Pastikan footer berada di bawah instruction box dengan jarak aman
  const footerMinTop = instructY + instructionBoxHeight + 60;
  const footerY = Math.max(canvasHeight - 120, footerMinTop);
    
    // Footer background
    ctx.fillStyle = colors.primary;
    ctx.fillRect(30, footerY - 20, canvasWidth - 60, 80);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(30, footerY - 20, canvasWidth - 60, 80);
    
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 20px DejaVu Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 2;
  // Avoid emojis to prevent missing glyphs
  ctx.fillText('MUSDA II HIMPERRA LAMPUNG', canvasWidth/2, footerY + 5);
    
  ctx.font = '14px DejaVu Sans, sans-serif';
    ctx.fillStyle = colors.white;
    ctx.shadowBlur = 1;
    ctx.fillText('Sekolah Properti Himperra', canvasWidth/2, footerY + 25);
    
  ctx.font = '12px DejaVu Sans, sans-serif';
    ctx.fillStyle = colors.lightGray;
    ctx.fillText('© 2025 SPH - Himpunan Pengembang Perumahan dan Permukiman Rakyat Daerah Lampung', canvasWidth/2, footerY + 45);
    ctx.shadowBlur = 0;
    
    // Decorative elements
    // Top right corner decoration
    ctx.fillStyle = colors.gold;
    ctx.beginPath();
    ctx.arc(canvasWidth - 30, 30, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Bottom left corner decoration
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(30, canvasHeight - 30, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Save the canvas as PNG
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