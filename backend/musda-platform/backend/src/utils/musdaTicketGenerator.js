const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const { logoToBase64 } = require('./logoConverter');

/**
 * Generate elegant MUSDA e-ticket PNG with embedded QR and participant details
 * @param {string} data - QR payload (e.g., MUSDA|<verification_token>)
 * @param {object} participant - { id, nama, email, whatsapp, instansi, created_at }
 * @param {string} outputPath - Absolute path to write the PNG file
 * @returns {Promise<string>} outputPath
 */
async function generateMusdaTicketPNG(data, participant, outputPath) {
  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const width = 800;
  const height = 1600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Palette (dark + gold like sample)
  const colors = {
    bgTop: '#111827',       // slate-900
    bgBottom: '#1f2937',    // gray-800
    gold: '#fbbf24',        // amber-400
    goldDeep: '#d97706',    // amber-600
    white: '#ffffff',
    green: '#22c55e',
    text: '#e5e7eb',        // gray-200
    subtle: '#9ca3af'       // gray-400
  };

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, colors.bgTop);
  bg.addColorStop(1, colors.bgBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Outer gold frame
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Header area
  const headerH = 200;
  const headerGrad = ctx.createLinearGradient(0, 0, 0, headerH);
  headerGrad.addColorStop(0, '#0b1020');
  headerGrad.addColorStop(1, '#101826');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(40, 40, width - 80, headerH);
  ctx.strokeStyle = colors.goldDeep;
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, width - 80, headerH);

  // MUSDA logo (if available)
  let logoImg = null;
  try {
    const b64 = logoToBase64();
    if (b64) {
      const raw = b64.split(',')[1];
      const buf = Buffer.from(raw, 'base64');
      const temp = path.join(dir, 'musda_logo_tmp.png');
      fs.writeFileSync(temp, buf);
      logoImg = await loadImage(temp);
      fs.unlinkSync(temp);
    }
  } catch {}

  if (logoImg) {
    ctx.drawImage(logoImg, 60, 60, 120, 120);
  }

  // Title
  ctx.fillStyle = colors.gold;
  ctx.font = 'bold 44px Georgia';
  ctx.textAlign = 'left';
  ctx.fillText('E-Ticket MUSDA II', 200, 115);
  ctx.fillStyle = colors.text;
  ctx.font = '24px Georgia';
  const year = (participant.created_at ? new Date(participant.created_at) : new Date()).getFullYear();
  ctx.fillText(`HIMPERRA Lampung ${year}`, 200, 150);
  ctx.fillStyle = colors.subtle;
  ctx.font = '18px Georgia';
  ctx.fillText('Tiket Resmi • Jangan Hilangkan', 200, 180);

  // QR area (center)
  const qrSize = 300;
  const qrX = (width - qrSize) / 2;
  const qrY = 310;

  // QR background and border
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

  const qrDataUrl = await QRCode.toDataURL(data, {
    width: qrSize,
    margin: 0,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M'
  });
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Participant block
  const infoY = qrY + qrSize + 40;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(60, infoY, width - 120, 260);
  ctx.strokeStyle = colors.goldDeep;
  ctx.lineWidth = 3;
  ctx.strokeRect(60, infoY, width - 120, 260);

  ctx.textAlign = 'center';
  ctx.fillStyle = colors.gold;
  ctx.font = 'bold 34px Georgia';
  ctx.fillText(participant.nama || '-', width / 2, infoY + 55);

  ctx.fillStyle = colors.text;
  ctx.font = '18px Georgia';
  const instansi = participant.instansi || participant.asal_instansi || '-';
  ctx.fillText(instansi, width / 2, infoY + 90);

  ctx.fillStyle = colors.subtle;
  ctx.font = '16px Georgia';
  ctx.fillText(participant.email || '-', width / 2, infoY + 120);
  ctx.fillText((participant.whatsapp || '').toString(), width / 2, infoY + 145);

  const tanggal = (participant.created_at ? new Date(participant.created_at) : new Date()).toLocaleDateString('id-ID');
  ctx.fillStyle = colors.text;
  ctx.font = '18px Georgia';
  ctx.fillText(`Tanggal Daftar: ${tanggal}`, width / 2, infoY + 180);

  // Kategori & Kota cards (if provided)
  const cardY = infoY + 200;
  const cardW = 260;
  const cardH = 70;
  const gap = 60;
  const hasKategori = !!(participant.kategori);
  const hasKota = !!(participant.kota);
  const cards = [];
  if (hasKategori) cards.push({ label: 'Kategori', value: participant.kategori });
  if (hasKota) cards.push({ label: 'Kota', value: participant.kota });
  if (cards.length) {
    const totalW = cards.length * cardW + (cards.length - 1) * gap;
    let startX = (width - totalW) / 2;
    cards.forEach((c) => {
      ctx.fillStyle = colors.gold;
      ctx.fillRect(startX, cardY, cardW, cardH);
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 18px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, startX + cardW/2, cardY + 26);
      ctx.fillStyle = '#111827';
      ctx.font = '16px Georgia';
      ctx.fillText(c.value, startX + cardW/2, cardY + 48);
      startX += cardW + gap;
    });
  }

  // “Registrasi Berhasil” ribbon
  const ribbonY = (cards.length ? cardY + cardH + 20 : infoY + 210);
  ctx.fillStyle = colors.green;
  ctx.fillRect(width / 2 - 200, ribbonY, 400, 44);
  ctx.fillStyle = colors.white;
  ctx.font = 'bold 22px Georgia';
  ctx.fillText('Registrasi Berhasil', width / 2, ribbonY + 30);

  // Footer with MUSDA wording
  const footerY = height - 180;
  ctx.fillStyle = colors.gold;
  ctx.font = 'bold 18px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(`MUSDA II HIMPERRA Lampung ${year}`, width / 2, footerY);
  ctx.fillStyle = colors.text;
  ctx.font = '16px Georgia';
  ctx.fillText('Scan QR di atas untuk validasi kehadiran', width / 2, footerY + 28);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

module.exports = { generateMusdaTicketPNG };
