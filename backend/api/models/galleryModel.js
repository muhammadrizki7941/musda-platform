const db = require('../utils/db');

const galleryModel = {
  // Get all gallery items (ordered by sort_order)
  async getAll() {
    const [rows] = await db.execute(
      'SELECT * FROM gallery_items WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC'
    );
    return rows;
  },

  // Get all gallery items for admin (including inactive)
  async getAllForAdmin() {
    const [rows] = await db.execute(
      'SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC'
    );
    return rows;
  },

  // Get gallery item by ID
  async getById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM gallery_items WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Create new gallery item
  async create(galleryData) {
    const { image_url, description, sort_order = 0 } = galleryData;
    const [result] = await db.execute(
      'INSERT INTO gallery_items (image_url, description, sort_order, is_active) VALUES (?, ?, ?, 1)',
      [image_url, description, sort_order]
    );
    return result.insertId;
  },

  // Update gallery item
  async update(id, galleryData) {
    const { image_url, description, sort_order, is_active } = galleryData;
    const [result] = await db.execute(
      'UPDATE gallery_items SET image_url = ?, description = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [image_url, description, sort_order, is_active, id]
    );
    return result.affectedRows > 0;
  },

  // Delete gallery item (soft delete)
  async delete(id) {
    const [result] = await db.execute(
      'UPDATE gallery_items SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Hard delete gallery item
  async hardDelete(id) {
    const [result] = await db.execute(
      'DELETE FROM gallery_items WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Update sort order for multiple items
  async updateSortOrder(items) {
    const promises = items.map(item => 
      db.execute(
        'UPDATE gallery_items SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [item.sort_order, item.id]
      )
    );
    await Promise.all(promises);
    return true;
  },

  // Get maximum sort order
  async getMaxSortOrder() {
    const [rows] = await db.execute(
      'SELECT MAX(sort_order) as max_order FROM gallery_items'
    );
    return rows[0].max_order || 0;
  }
};

module.exports = galleryModel;