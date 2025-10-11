const db = require('../utils/db');

const Agenda = {
  create: async (data) => {
    const sql = 'INSERT INTO agendas (title, description, start_time, end_time, agenda_date, location, speaker, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [
      data.title, 
      data.description, 
      data.startTime, 
      data.endTime, 
      data.date, 
      data.location, 
      data.speaker, 
      data.is_active !== undefined ? data.is_active : 1
    ]);
    return result;
  },
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM agendas WHERE id = ?', [id]);
    return rows[0];
  },
  list: async (filter = {}) => {
    let sql = 'SELECT * FROM agendas ORDER BY agenda_date ASC, start_time ASC';
    const params = [];
    const [rows] = await db.query(sql, params);
    return rows;
  },
  update: async (id, data) => {
    const sql = 'UPDATE agendas SET title = ?, description = ?, start_time = ?, end_time = ?, agenda_date = ?, location = ?, speaker = ?, is_active = ? WHERE id = ?';
    const [result] = await db.query(sql, [
      data.title, 
      data.description, 
      data.startTime, 
      data.endTime, 
      data.date, 
      data.location, 
      data.speaker, 
      data.is_active !== undefined ? data.is_active : 1, 
      id
    ]);
    return result;
  },
  delete: async (id) => {
    const [result] = await db.query('DELETE FROM agendas WHERE id = ?', [id]);
    return result;
  }
};

module.exports = Agenda;
