const { dbPromise: db } = require('../utils/db');

// Helper to extract only YYYY-MM-DD portion from any incoming date string
function extractDatePart(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const match = String(value).match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null; // return null if not matched so DB can reject invalid instead of truncated
}

// Coerce boolean-ish to 0/1
function toBit(v, fallback = 1) {
  if (v === undefined || v === null) return fallback;
  return v === true || v === 1 || v === '1' ? 1 : 0;
}

const Agenda = {
  create: async (data) => {
    const agendaDate = extractDatePart(data.date || data.agenda_date);
    const isActive = toBit(data.is_active, 1);
    const sql = 'INSERT INTO agendas (title, description, start_time, end_time, agenda_date, location, speaker, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [
      data.title,
      data.description || '',
      data.startTime,
      data.endTime,
      agendaDate,
      data.location || '',
      data.speaker || '',
      isActive
    ]);
    return result;
  },
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM agendas WHERE id = ?', [id]);
    return rows[0];
  },
  list: async () => {
    const sql = 'SELECT * FROM agendas ORDER BY agenda_date ASC, start_time ASC';
    const [rows] = await db.query(sql, []);
    return rows;
  },
  update: async (id, data) => {
    const agendaDate = extractDatePart(data.date || data.agenda_date);
    const isActive = toBit(data.is_active, 1);
    const sql = 'UPDATE agendas SET title = ?, description = ?, start_time = ?, end_time = ?, agenda_date = ?, location = ?, speaker = ?, is_active = ? WHERE id = ?';
    const [result] = await db.query(sql, [
      data.title,
      data.description || '',
      data.startTime,
      data.endTime,
      agendaDate,
      data.location || '',
      data.speaker || '',
      isActive,
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
