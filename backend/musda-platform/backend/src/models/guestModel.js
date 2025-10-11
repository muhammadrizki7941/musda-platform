const { dbPromise } = require('../utils/db');

const Guest = {
  create: async (data) => {
    const sql = 'INSERT INTO guests (nama, email, whatsapp, asal_instansi, status_kehadiran) VALUES (?, ?, ?, ?, ?)';
    const [result] = await dbPromise.query(sql, [
      data.nama, 
      data.email, 
      data.whatsapp, 
      data.instansi || data.asal_instansi || '', 
      'pending'
    ]);
    return result;
  },
  findById: async (id) => {
    const [rows] = await dbPromise.query('SELECT * FROM guests WHERE id = ?', [id]);
    return rows[0];
  },
  updateStatus: async (id) => {
    const [result] = await dbPromise.query('UPDATE guests SET status_kehadiran = ? WHERE id = ?', ['hadir', id]);
    return result;
  },
  list: async (filter) => {
    let sql = 'SELECT * FROM guests';
    if (filter === 'hadir') sql += ' WHERE status_kehadiran = "hadir"';
    else if (filter === 'belum') sql += ' WHERE status_kehadiran = "pending"';
    const [rows] = await dbPromise.query(sql);
    return rows;
  },
  update: async (id, data) => {
    const sql = 'UPDATE guests SET nama = ?, email = ?, whatsapp = ?, asal_instansi = ? WHERE id = ?';
    const [result] = await dbPromise.query(sql, [
      data.nama, 
      data.email, 
      data.whatsapp, 
      data.instansi || data.asal_instansi || '', 
      id
    ]);
    return result;
  },
  delete: async (id) => {
    const [result] = await dbPromise.query('DELETE FROM guests WHERE id = ?', [id]);
    return result;
  }
};

module.exports = Guest;
