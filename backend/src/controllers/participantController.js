const Participant = require('../models/participantModel');
const TicketGenerator = require('../utils/ticketGenerator');
const EmailService = require('../utils/emailService');

const participantController = {
  // Register participant
  register: async (req, res) => {
    try {
      const { nama, email, whatsapp, paymentMethod, kategori, asal_instansi, alasan_ikut } = req.body;

      // Validation
      if (!nama || !email || !whatsapp || !paymentMethod || !asal_instansi || !alasan_ikut) {
        return res.status(400).json({ error: 'Semua field wajib diisi' });
      }

      if (!['qris', 'manual'].includes(paymentMethod)) {
        return res.status(400).json({ error: 'Metode pembayaran tidak valid' });
      }

      if (!['umum', 'mahasiswa'].includes(kategori)) {
        return res.status(400).json({ error: 'Kategori peserta tidak valid' });
      }

      // Email validation
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Format email tidak valid' });
      }

      // WhatsApp number formatting
      let hp = whatsapp.replace(/\D/g, '');
      if (hp.startsWith('0')) hp = '62' + hp.slice(1);
      if (!hp.startsWith('62')) hp = '62' + hp;
      if (hp.length < 10 || hp.length > 15) {
        return res.status(400).json({ error: 'Nomor WhatsApp tidak valid' });
      }
      const formattedWhatsapp = '+' + hp;

      // Check if already registered
      const existingEmail = await Participant.findByEmail(email);
      const existingWhatsapp = await Participant.findByWhatsapp(formattedWhatsapp);
      
      if (existingEmail || existingWhatsapp) {
        return res.status(409).json({ 
          error: 'Email atau nomor WhatsApp sudah terdaftar. Silakan gunakan data yang berbeda.' 
        });
      }

      // Generate payment code
      const paymentCode = Participant.generatePaymentCode();

      // Determine amount based on kategori
      const amount = kategori === 'mahasiswa' ? 100000.00 : 150000.00;

      // Create participant
      const result = await Participant.create({
        nama,
        email,
        whatsapp: formattedWhatsapp,
        paymentMethod,
        paymentCode,
        amount,
        kategori: kategori || 'umum',
        asal_instansi,
        alasan_ikut
      });

      const participantId = result.insertId;

      // If QRIS payment, automatically mark as paid and generate ticket
      if (paymentMethod === 'qris') {
        await Participant.updatePaymentStatus(participantId, 'paid');
        
        // Generate and send ticket
        const participant = await Participant.findById(participantId);
        const ticketFile = await TicketGenerator.generateTicket(participant);
        
        // Update ticket URL
        await Participant.updatePaymentStatus(participantId, 'paid', ticketFile.url);
        
        // Kirim email e-ticket di background agar response cepat
        const emailService = new EmailService();
        setImmediate(async () => {
          try {
            await emailService.sendTicketEmail(participant, ticketFile);
          } catch (err) {
            console.error('Error sending e-ticket email (async):', err);
          }
        });

        return res.json({
          id: participantId,
          paymentCode,
          status: 'paid',
          amount,
          message: 'Pendaftaran berhasil! E-tiket akan dikirim ke email Anda dalam beberapa menit.',
          ticketUrl: ticketFile.url
        });
      }

      // For manual payment, return payment info
      res.json({
        id: participantId,
        paymentCode,
        status: 'pending',
        amount,
        message: 'Pendaftaran berhasil! Silakan lanjutkan pembayaran.'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Gagal memproses pendaftaran' });
    }
  },

  // List participants (admin only)
  list: async (req, res) => {
    try {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.method) filter.method = req.query.method;
      if (req.query.kategori) filter.kategori = req.query.kategori;

      const participants = await Participant.list(filter);
      res.json(participants);
    } catch (error) {
      console.error('List participants error:', error);
      res.status(500).json({ error: 'Gagal mengambil data peserta' });
    }
  },

  // Get participant by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const participant = await Participant.findById(id);
      
      if (!participant) {
        return res.status(404).json({ error: 'Peserta tidak ditemukan' });
      }

      res.json(participant);
    } catch (error) {
      console.error('Get participant error:', error);
      res.status(500).json({ error: 'Gagal mengambil data peserta' });
    }
  },

  // Confirm payment (admin only)
  confirmPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const participant = await Participant.findById(id);
      if (!participant) {
        return res.status(404).json({ error: 'Peserta tidak ditemukan' });
      }

      if (participant.paymentStatus === 'paid') {
        return res.status(400).json({ error: 'Pembayaran sudah dikonfirmasi sebelumnya' });
      }

      // Generate and send ticket
      const ticketFile = await TicketGenerator.generateTicket(participant);
      
      // Update status to paid
      await Participant.updatePaymentStatus(id, 'paid', ticketFile.url);
      
      // Update notes if provided
      if (notes) {
        await Participant.update(id, { ...participant, notes, paymentStatus: 'paid' });
      }

      // Send confirmation email first
      const emailService = new EmailService();
      await emailService.sendPaymentConfirmation(participant);
      
      // Then send ticket
      const updatedParticipant = await Participant.findById(id);
      await emailService.sendTicketEmail(updatedParticipant, ticketFile);

      res.json({
        message: 'Pembayaran berhasil dikonfirmasi dan e-tiket telah dikirim',
        ticketUrl: ticketFile.url
      });

    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({ error: 'Gagal mengkonfirmasi pembayaran' });
    }
  },

  // Update participant
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const participant = await Participant.findById(id);
      if (!participant) {
        return res.status(404).json({ error: 'Peserta tidak ditemukan' });
      }

      await Participant.update(id, updateData);
      res.json({ message: 'Data peserta berhasil diupdate' });

    } catch (error) {
      console.error('Update participant error:', error);
      res.status(500).json({ error: 'Gagal mengupdate data peserta' });
    }
  },

  // Delete participant
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const participant = await Participant.findById(id);
      if (!participant) {
        return res.status(404).json({ error: 'Peserta tidak ditemukan' });
      }

      await Participant.delete(id);
      res.json({ message: 'Data peserta berhasil dihapus' });

    } catch (error) {
      console.error('Delete participant error:', error);
      res.status(500).json({ error: 'Gagal menghapus data peserta' });
    }
  }
};

module.exports = participantController;