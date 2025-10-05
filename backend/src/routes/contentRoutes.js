const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { dbPromise } = require('../utils/db');

// Get all content items
router.get('/content', authMiddleware, async (req, res) => {
  try {
    const [rows] = await dbPromise.execute(`
      SELECT id, title, slug, content, status, type, meta_description, 
             featured_image, created_at, updated_at 
      FROM content 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
});

// Create new content
router.post('/content', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, slug, content, status, type, meta_description, featured_image } = req.body;
    
    const [result] = await dbPromise.execute(`
      INSERT INTO content (title, slug, content, status, type, meta_description, featured_image, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [title, slug, content, status || 'draft', type || 'page', meta_description, featured_image]);
    
    res.json({
      success: true,
      message: 'Content created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content',
      error: error.message
    });
  }
});

// Update content
router.put('/content/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, status, type, meta_description, featured_image } = req.body;
    
    await dbPromise.execute(`
      UPDATE content 
      SET title = ?, slug = ?, content = ?, status = ?, type = ?, 
          meta_description = ?, featured_image = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, slug, content, status, type, meta_description, featured_image, id]);
    
    res.json({
      success: true,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content',
      error: error.message
    });
  }
});

// Delete content
router.delete('/content/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
  const { id } = req.params;
    
  await dbPromise.execute('DELETE FROM content WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
});

module.exports = router;