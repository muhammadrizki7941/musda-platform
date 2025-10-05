const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

class TicketGenerator {
  static async generateTicket(participant) {
    try {
      // Create tickets directory if it doesn't exist
      const ticketsDir = path.join(__dirname, '../../uploads/tickets');
      if (!fs.existsSync(ticketsDir)) {
        fs.mkdirSync(ticketsDir, { recursive: true });
      }

      // Generate filename
      const filename = `ticket-${participant.id}-${Date.now()}.pdf`;
      const filepath = path.join(ticketsDir, filename);

      // Generate QR code
      const qrData = JSON.stringify({
        participantId: participant.id,
        nama: participant.nama,
        email: participant.email,
        eventCode: 'SEKOLAH-PROPERTI-2025'
      });
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Pipe to file
      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(24)
         .fillColor('#2C5530')
         .text('E-TIKET', 50, 50, { align: 'center' });

      doc.fontSize(20)
         .fillColor('#1F4E23')
         .text('Sekolah Properti HIMPERRA Lampung', 50, 80, { align: 'center' });

      // Event details
      doc.fontSize(12)
         .fillColor('#666666')
         .text('Tanggal: 15 November 2025', 50, 120)
         .text('Waktu: 08:00 - 17:00 WIB', 50, 135)
         .text('Tempat: Hotel Radisson Bandar Lampung', 50, 150);

      // Participant info box
      doc.rect(50, 180, 495, 120)
         .stroke('#CCCCCC');

      doc.fontSize(14)
         .fillColor('#333333')
         .text('INFORMASI PESERTA', 60, 190, { underline: true });

      doc.fontSize(12)
         .text(`Nama: ${participant.nama}`, 60, 215)
         .text(`Email: ${participant.email}`, 60, 235)
         .text(`WhatsApp: ${participant.whatsapp}`, 60, 255)
         .text(`Kategori: ${participant.kategori === 'mahasiswa' ? 'Mahasiswa' : 'Umum'}`, 60, 275)
         .text(`Asal: ${participant.asal_instansi}`, 60, 295);

      // QR Code
      const qrBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
      doc.image(qrBuffer, 400, 320, { width: 120, height: 120 });

      // QR Code label
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Scan QR untuk Check-in', 420, 450, { align: 'center', width: 80 });

      // Payment info box
      doc.fontSize(10)
         .fillColor('#555555')
         .text(`Kode Pembayaran: ${participant.paymentCode || 'N/A'}`, 60, 315)
         .text(`Biaya: Rp ${participant.amount ? participant.amount.toLocaleString('id-ID') : '150.000'}`, 60, 330);

      // Important notes
      doc.fontSize(12)
         .fillColor('#333333')
         .text('PETUNJUK PENTING:', 50, 350, { underline: true });

      const instructions = [
        '• Harap tiba 30 menit sebelum acara dimulai',
        '• Tunjukkan e-tiket ini atau QR code saat check-in',
        '• Bawa identitas diri (KTP/SIM)',
        '• Berpakaian rapi (kemeja/blouse, celana panjang)',
        '• Acara akan dimulai tepat waktu'
      ];

      let yPos = 375;
      instructions.forEach(instruction => {
        doc.fontSize(10)
           .fillColor('#555555')
           .text(instruction, 60, yPos);
        yPos += 15;
      });

      // Footer
      doc.fontSize(8)
         .fillColor('#999999')
         .text('Diterbitkan secara otomatis oleh sistem MUSDA II HIMPERRA Lampung', 50, 500, { align: 'center' })
         .text(`Tiket ID: ${participant.id} | Dicetak: ${new Date().toLocaleString('id-ID')}`, 50, 515, { align: 'center' });

      // Contact info
      doc.fontSize(10)
         .fillColor('#2C5530')
         .text('Hubungi kami: dpdhimperralampung@gmail.com | WA: 0812-3456-7890', 50, 540, { align: 'center' });

      // Logo placeholder (you can add actual logo later)
      doc.fontSize(8)
         .fillColor('#CCCCCC')
         .text('LOGO HIMPERRA', 50, 560, { align: 'left' });

      // Finalize PDF
      doc.end();

      return {
        filename,
        filepath,
        url: `/uploads/tickets/${filename}`
      };

    } catch (error) {
      console.error('Error generating ticket:', error);
      throw new Error('Failed to generate ticket');
    }
  }

  static async generateQRCode(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }
}

module.exports = TicketGenerator;