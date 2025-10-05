const TicketGenerator = require('../utils/ticketGenerator');

const paymentController = {
  // Generate QRIS payment
  generateQRIS: async (req, res) => {
    try {
      const { participantId, amount, kategori } = req.body;

      if (!participantId) {
        return res.status(400).json({ error: 'ID peserta diperlukan' });
      }

      // Determine amount based on kategori if not provided
      const finalAmount = amount || (kategori === 'mahasiswa' ? 100000 : 150000);

      // For now, generate a dummy QRIS
      // In production, integrate with actual QRIS provider
      const qrisData = {
        merchantId: 'HIMPERRA_LAMPUNG',
        amount: finalAmount,
        participantId: participantId,
        timestamp: Date.now(),
        currency: 'IDR'
      };

      const qrCodeURL = await TicketGenerator.generateQRCode(qrisData);

      res.json({
        qrCode: qrCodeURL,
        amount: finalAmount,
        merchantName: 'HIMPERRA Lampung',
        description: 'Pembayaran Sekolah Properti',
        expiryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        paymentCode: qrisData.participantId
      });

    } catch (error) {
      console.error('QRIS generation error:', error);
      res.status(500).json({ error: 'Gagal generate QRIS' });
    }
  },

  // Get bank account info for manual transfer
  getBankAccount: async (req, res) => {
    try {
      // In production, this could be stored in database
      // For now, return static bank account info
      const bankAccounts = [
        {
          bankName: 'Bank BCA',
          accountNumber: '1234567890',
          accountName: 'HIMPERRA LAMPUNG',
          branch: 'Bandar Lampung'
        },
        {
          bankName: 'Bank Mandiri',
          accountNumber: '9876543210',
          accountName: 'HIMPERRA LAMPUNG',
          branch: 'Bandar Lampung'
        },
        {
          bankName: 'Bank BRI',
          accountNumber: '5555666677',
          accountName: 'HIMPERRA LAMPUNG',
          branch: 'Bandar Lampung'
        }
      ];

      res.json({
        amount: 150000, // Default amount, will be adjusted based on kategori
        currency: 'IDR',
        description: 'Biaya Pendaftaran Sekolah Properti HIMPERRA Lampung',
        pricing: {
          umum: 150000,
          mahasiswa: 100000
        },
        accounts: bankAccounts,
        instructions: [
          'Transfer sesuai nominal berdasarkan kategori peserta',
          'Umum: Rp 150.000 | Mahasiswa: Rp 100.000',
          'Gunakan kode pembayaran sebagai berita transfer',
          'Simpan bukti transfer',
          'Konfirmasi pembayaran melalui WhatsApp: 0812-3456-7890',
          'Pembayaran akan diverifikasi dalam 1x24 jam'
        ],
        adminContact: {
          whatsapp: '081234567890',
          email: 'dpdhimperralampung@gmail.com'
        }
      });

    } catch (error) {
      console.error('Bank account error:', error);
      res.status(500).json({ error: 'Gagal mengambil informasi rekening' });
    }
  },

  // Check payment status
  checkPaymentStatus: async (req, res) => {
    try {
      const { paymentCode } = req.params;

      // This is a dummy implementation
      // In production, integrate with actual payment gateway
      
      // For demo purposes, return random status
      const statuses = ['pending', 'paid', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      res.json({
        paymentCode,
        status: randomStatus,
        timestamp: new Date().toISOString(),
        amount: 150000
      });

    } catch (error) {
      console.error('Payment status check error:', error);
      res.status(500).json({ error: 'Gagal mengecek status pembayaran' });
    }
  }
};

module.exports = paymentController;