const { dbPromise: db } = require('../utils/db');

let schema = null;
async function detectSchema() {
  if (schema) return schema;
  const [cols] = await db.execute('SHOW COLUMNS FROM gallery_items');
  const names = new Set(cols.map(c => c.Field));
  schema = {
    hasImageUrl: names.has('image_url'),
    hasImagePath: names.has('image_path'),
    hasSortOrder: names.has('sort_order'),
    hasDisplayOrder: names.has('display_order'),
    hasIsActive: names.has('is_active'),
    hasCreatedAt: names.has('created_at'),
    hasUpdatedAt: names.has('updated_at')
  };
  return schema;
}

function normalizeRow(s, row) {
  const image_url = s.hasImageUrl ? row.image_url : (s.hasImagePath ? row.image_path : row.image_url);
  const sort_order = s.hasSortOrder ? row.sort_order : (s.hasDisplayOrder ? row.display_order : row.sort_order);
  const is_active = s.hasIsActive ? row.is_active : 1;
  return { ...row, image_url, sort_order, is_active };
}

const galleryModel = {
  // Get all gallery items (ordered by sort/display order)
  async getAll() {
    const s = await detectSchema();
    const selectCols = [
      'id',
      s.hasImageUrl ? 'image_url' : (s.hasImagePath ? 'image_path AS image_url' : "'' AS image_url"),
      'description',
      s.hasSortOrder ? 'sort_order' : (s.hasDisplayOrder ? 'display_order AS sort_order' : '0 AS sort_order'),
      s.hasIsActive ? 'is_active' : '1 AS is_active',
      s.hasCreatedAt ? 'created_at' : 'CURRENT_TIMESTAMP AS created_at',
      s.hasUpdatedAt ? 'updated_at' : 'CURRENT_TIMESTAMP AS updated_at'
    ].join(', ');
    let sql = `SELECT ${selectCols} FROM gallery_items`;
    const where = [];
    if (s.hasIsActive) where.push('is_active = 1');
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += s.hasSortOrder || s.hasDisplayOrder ? ' ORDER BY sort_order ASC, created_at ASC' : ' ORDER BY id DESC';
    const [rows] = await db.execute(sql);
    return rows.map(r => normalizeRow(s, r));
  },

  // Get all gallery items for admin (including inactive)
  async getAllForAdmin() {
    const s = await detectSchema();
    const selectCols = [
      'id',
      s.hasImageUrl ? 'image_url' : (s.hasImagePath ? 'image_path AS image_url' : "'' AS image_url"),
      'description',
      s.hasSortOrder ? 'sort_order' : (s.hasDisplayOrder ? 'display_order AS sort_order' : '0 AS sort_order'),
      s.hasIsActive ? 'is_active' : '1 AS is_active',
      s.hasCreatedAt ? 'created_at' : 'CURRENT_TIMESTAMP AS created_at',
      s.hasUpdatedAt ? 'updated_at' : 'CURRENT_TIMESTAMP AS updated_at'
    ].join(', ');
    let sql = `SELECT ${selectCols} FROM gallery_items`;
    sql += s.hasSortOrder || s.hasDisplayOrder ? ' ORDER BY sort_order ASC, created_at DESC' : ' ORDER BY id DESC';
    const [rows] = await db.execute(sql);
    return rows.map(r => normalizeRow(s, r));
  },

  // Get gallery item by ID
  async getById(id) {
    const s = await detectSchema();
    const selectCols = [
      'id',
      s.hasImageUrl ? 'image_url' : (s.hasImagePath ? 'image_path AS image_url' : "'' AS image_url"),
      'description',
      s.hasSortOrder ? 'sort_order' : (s.hasDisplayOrder ? 'display_order AS sort_order' : '0 AS sort_order'),
      s.hasIsActive ? 'is_active' : '1 AS is_active',
      s.hasCreatedAt ? 'created_at' : 'CURRENT_TIMESTAMP AS created_at',
      s.hasUpdatedAt ? 'updated_at' : 'CURRENT_TIMESTAMP AS updated_at'
    ].join(', ');
    const [rows] = await db.execute(`SELECT ${selectCols} FROM gallery_items WHERE id = ?`, [id]);
    return rows[0] ? normalizeRow(s, rows[0]) : undefined;
  },

  // Create new gallery item
  async create(galleryData) {
    const s = await detectSchema();
    const cols = ['description'];
    const vals = [galleryData.description];
    if (s.hasImageUrl) { cols.push('image_url'); vals.push(galleryData.image_url); }
    else if (s.hasImagePath) { cols.push('image_path'); vals.push(galleryData.image_url); }
    if (s.hasSortOrder) { cols.push('sort_order'); vals.push(galleryData.sort_order ?? 0); }
    else if (s.hasDisplayOrder) { cols.push('display_order'); vals.push(galleryData.sort_order ?? 0); }
    if (s.hasIsActive) { cols.push('is_active'); vals.push(1); }
    const placeholders = cols.map(() => '?').join(', ');
    const sql = `INSERT INTO gallery_items (${cols.join(', ')}) VALUES (${placeholders})`;
    const [result] = await db.execute(sql, vals);
    return result.insertId;
  },

  // Update gallery item
  async update(id, galleryData) {
    const s = await detectSchema();
    const sets = ['description = ?'];
    const vals = [galleryData.description];
    if (s.hasImageUrl) { sets.push('image_url = ?'); vals.push(galleryData.image_url); }
    else if (s.hasImagePath) { sets.push('image_path = ?'); vals.push(galleryData.image_url); }
    if (s.hasSortOrder) { sets.push('sort_order = ?'); vals.push(galleryData.sort_order); }
    else if (s.hasDisplayOrder) { sets.push('display_order = ?'); vals.push(galleryData.sort_order); }
    if (s.hasIsActive) { sets.push('is_active = ?'); vals.push(galleryData.is_active); }
    const sql = `UPDATE gallery_items SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    vals.push(id);
    const [result] = await db.execute(sql, vals);
    return result.affectedRows > 0;
  },

  // Delete gallery item (soft delete if possible)
  async delete(id) {
    const s = await detectSchema();
    if (s.hasIsActive) {
      const [result] = await db.execute('UPDATE gallery_items SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
      return result.affectedRows > 0;
    }
    const [result] = await db.execute('DELETE FROM gallery_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Hard delete gallery item
  async hardDelete(id) {
    const [result] = await db.execute('DELETE FROM gallery_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Update sort order for multiple items
  async updateSortOrder(items) {
    const s = await detectSchema();
    const promises = items.map(item => {
      const sql = s.hasSortOrder
        ? 'UPDATE gallery_items SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        : (s.hasDisplayOrder
            ? 'UPDATE gallery_items SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
            : 'UPDATE gallery_items SET id = id WHERE id = ?'); // no-op fallback
      const params = s.hasSortOrder || s.hasDisplayOrder ? [item.sort_order, item.id] : [item.id];
      return db.execute(sql, params);
    });
    await Promise.all(promises);
    return true;
  },

  // Get maximum sort order
  async getMaxSortOrder() {
    const s = await detectSchema();
    const sql = s.hasSortOrder
      ? 'SELECT MAX(sort_order) as max_order FROM gallery_items'
      : (s.hasDisplayOrder ? 'SELECT MAX(display_order) as max_order FROM gallery_items' : 'SELECT 0 as max_order');
    const [rows] = await db.execute(sql);
    return rows[0].max_order || 0;
  }
};

module.exports = galleryModel;