const db = require('../utils/db');

const Participant = {
  create: async (data) => {
    const sql = `INSERT INTO participants 
      (nama, email, whatsapp, paymentMethod, paymentCode, amount, notes, kategori, asal_instansi, alasan_ikut) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [
      data.nama, 
      data.email, 
      data.whatsapp, 
      data.paymentMethod,
      data.paymentCode || null,
      data.amount || 150000.00,
      data.notes || null,
      data.kategori || 'umum',
      data.asal_instansi,
      data.alasan_ikut
    ]);
    return result;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM participants WHERE id = ?', [id]);
    return rows[0];
  },

  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM participants WHERE email = ?', [email]);
    return rows[0];
  },

  findByWhatsapp: async (whatsapp) => {
    const [rows] = await db.query('SELECT * FROM participants WHERE whatsapp = ?', [whatsapp]);
    return rows[0];
  },

  updatePaymentStatus: async (id, status, ticketUrl = null) => {
    const sql = 'UPDATE participants SET paymentStatus = ?, ticketUrl = ?, updated_at = NOW() WHERE id = ?';
    const [result] = await db.query(sql, [status, ticketUrl, id]);
    return result;
  },

  list: async (filter) => {
    let sql = 'SELECT * FROM participants ORDER BY created_at DESC';
    const params = [];
    
    if (filter) {
      if (filter.status) {
        sql = 'SELECT * FROM participants WHERE paymentStatus = ? ORDER BY created_at DESC';
        params.push(filter.status);
      }
      if (filter.method) {
        const whereClause = params.length > 0 ? ' AND paymentMethod = ?' : ' WHERE paymentMethod = ?';
        sql = sql.replace(' ORDER BY', whereClause + ' ORDER BY');
        params.push(filter.method);
      }
      if (filter.kategori) {
        const whereClause = params.length > 0 ? ' AND kategori = ?' : ' WHERE kategori = ?';
        sql = sql.replace(' ORDER BY', whereClause + ' ORDER BY');
        params.push(filter.kategori);
      }
    }
    
    const [rows] = await db.query(sql, params);
    return rows;
  },

  update: async (id, data) => {
    const sql = `UPDATE participants SET 
      nama = ?, email = ?, whatsapp = ?, paymentMethod = ?, 
      paymentStatus = ?, notes = ?, kategori = ?, asal_instansi = ?, 
      alasan_ikut = ?, updated_at = NOW() 
      WHERE id = ?`;
    const [result] = await db.query(sql, [
      data.nama, data.email, data.whatsapp, data.paymentMethod,
      data.paymentStatus, data.notes, data.kategori, data.asal_instansi,
      data.alasan_ikut, id
    ]);
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM participants WHERE id = ?', [id]);
    return result;
  },

  // Generate unique payment code
  generatePaymentCode: () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SP${timestamp.slice(-6)}${random}`;
  }
};

module.exports = Participant;