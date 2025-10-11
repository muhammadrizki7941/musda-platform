const { db, dbPromise } = require('../utils/db');

// Detect schema once and cache
let schema = null;
async function detectSchema() {
  if (schema) return schema;
  const [cols] = await dbPromise.query("SHOW COLUMNS FROM sponsors");
  const names = new Set(cols.map(c => c.Field));
  schema = {
    hasLogoPath: names.has('logo_path'),
    hasLogo: names.has('logo'),
    hasIsActive: names.has('is_active'),
    hasWebsite: names.has('website_url'),
    hasSortOrder: names.has('sort_order'),
    hasCreatedAt: names.has('created_at'),
  };
  return schema;
}

function normalizeRow(row) {
  return {
    ...row,
    // Expose a consistent logo_path field for frontends
    logo_path: row.logo_path ?? row.logo ?? row.logo_url ?? row.logoPath ?? null,
    // Derive is_active if column absent (treat as active)
    is_active: row.is_active !== undefined ? row.is_active : 1,
  };
}

const Sponsor = {
  create: async (data) => {
    const s = await detectSchema();
    const cols = ['name', 'category'];
    const vals = [data.name, data.category];
    // logo column
    if (s.hasLogoPath) { cols.push('logo_path'); vals.push(data.logo_path || data.logo || null); }
    else if (s.hasLogo) { cols.push('logo'); vals.push(data.logo_path || data.logo || null); }
    // optional columns
    if (s.hasWebsite) { cols.push('website_url'); vals.push(data.website_url || null); }
    if (s.hasIsActive) { cols.push('is_active'); vals.push(data.is_active !== undefined ? data.is_active : 1); }
    if (s.hasSortOrder) { cols.push('sort_order'); vals.push(data.sort_order || 0); }

    const placeholders = cols.map(() => '?').join(', ');
    const sql = `INSERT INTO sponsors (${cols.join(', ')}) VALUES (${placeholders})`;
    const [result] = await dbPromise.query(sql, vals);
    return result;
  },

  findById: async (id) => {
    const s = await detectSchema();
    // Build select with aliases for consistency
    const selectCols = [
      'id',
      'name',
      'category',
      s.hasLogoPath ? 'logo_path' : (s.hasLogo ? 'logo AS logo_path' : "'' AS logo_path"),
      s.hasWebsite ? 'website_url' : "NULL AS website_url",
      s.hasIsActive ? 'is_active' : '1 AS is_active',
      s.hasSortOrder ? 'sort_order' : '0 AS sort_order'
    ].join(', ');
    const [rows] = await dbPromise.query(`SELECT ${selectCols} FROM sponsors WHERE id = ?`, [id]);
    return rows[0] ? normalizeRow(rows[0]) : undefined;
  },

  list: async (category) => {
    const s = await detectSchema();
    const selectCols = [
      'id',
      'name',
      'category',
      s.hasLogoPath ? 'logo_path' : (s.hasLogo ? 'logo AS logo_path' : "'' AS logo_path"),
      s.hasWebsite ? 'website_url' : "NULL AS website_url",
      s.hasIsActive ? 'is_active' : '1 AS is_active',
      s.hasSortOrder ? 'sort_order' : '0 AS sort_order'
    ].join(', ');
    let sql = `SELECT ${selectCols} FROM sponsors`;
    const params = [];
    const where = [];
    if (s.hasIsActive) where.push('is_active = 1');
    if (category) { where.push('category = ?'); params.push(category); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    // Order-by if sort_order present
    sql += s.hasSortOrder ? ' ORDER BY sort_order ASC, id DESC' : ' ORDER BY id DESC';
    const [rows] = await dbPromise.query(sql, params);
    return rows.map(normalizeRow);
  },

  update: async (id, data) => {
    const s = await detectSchema();
    const sets = ['name = ?', 'category = ?'];
    const vals = [data.name, data.category];
    if (s.hasLogoPath) { sets.push('logo_path = ?'); vals.push(data.logo_path || data.logo || null); }
    else if (s.hasLogo) { sets.push('logo = ?'); vals.push(data.logo_path || data.logo || null); }
    if (s.hasWebsite) { sets.push('website_url = ?'); vals.push(data.website_url || null); }
    if (s.hasIsActive) { sets.push('is_active = ?'); vals.push(data.is_active !== undefined ? data.is_active : 1); }
    if (s.hasSortOrder) { sets.push('sort_order = ?'); vals.push(data.sort_order || 0); }
    const sql = `UPDATE sponsors SET ${sets.join(', ')} WHERE id = ?`;
    vals.push(id);
    const [result] = await dbPromise.query(sql, vals);
    return result;
  },

  delete: async (id) => {
    const s = await detectSchema();
    if (s.hasIsActive) {
      const [result] = await dbPromise.query('UPDATE sponsors SET is_active = 0 WHERE id = ?', [id]);
      return result;
    }
    const [result] = await dbPromise.query('DELETE FROM sponsors WHERE id = ?', [id]);
    return result;
  }
};

module.exports = Sponsor;
