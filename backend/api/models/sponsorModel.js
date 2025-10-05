const db = require('../utils/db');

const Sponsor = {
  create: async (data) => {
    const sql = 'INSERT INTO sponsors (name, logo_path, category, website_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [
      data.name, 
      data.logo_path || data.logo, 
      data.category, 
      data.website_url || null,
      data.is_active !== undefined ? data.is_active : 1,
      data.sort_order || 0
    ]);
    return result;
  },
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM sponsors WHERE id = ?', [id]);
    return rows[0];
  },
  list: async (category) => {
    let sql = 'SELECT * FROM sponsors WHERE is_active = 1';
    if (category) sql += ' AND category = ?';
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const [rows] = category ? await db.query(sql, [category]) : await db.query(sql);
    return rows;
  },
  update: async (id, data) => {
    const sql = 'UPDATE sponsors SET name = ?, logo_path = ?, category = ?, website_url = ?, is_active = ?, sort_order = ? WHERE id = ?';
    const [result] = await db.query(sql, [
      data.name, 
      data.logo_path || data.logo, 
      data.category, 
      data.website_url || null,
      data.is_active !== undefined ? data.is_active : 1,
      data.sort_order || 0,
      id
    ]);
    return result;
  },
  delete: async (id) => {
    // Soft delete - set is_active to 0
    const [result] = await db.query('UPDATE sponsors SET is_active = 0 WHERE id = ?', [id]);
    return result;
  }
};

module.exports = Sponsor;
