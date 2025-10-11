const { dbPromise: db } = require('../utils/db');

class SphContentModel {
  // Get all content by section
  static async getBySection(section) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM sph_content WHERE section = ? AND is_active = TRUE ORDER BY content_key',
        [section]
      );
      
      // Return array of objects for frontend compatibility
      return rows.map(row => {
        let value = row.content_value;
        
        // Parse based on content type
        switch(row.content_type) {
          case 'number':
            value = parseInt(value);
            break;
          case 'boolean':
            value = value === 'true';
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch(e) {
              console.error('Error parsing JSON:', e);
            }
            break;
          default:
            // text, html, image remain as string
            break;
        }
        
        return {
          id: row.id,
          section: row.section,
          content_key: row.content_key,
          content_value: typeof value === 'string' ? value : row.content_value,
          content_type: row.content_type,
          description: row.description,
          is_active: row.is_active,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      });
    } catch (error) {
      console.error('Error getting content by section:', error);
      throw error;
    }
  }

  // Get all content for frontend (simplified format)
  static async getAllForFrontend() {
    try {
      const [rows] = await db.execute(
        'SELECT section, content_key, content_value, content_type FROM sph_content WHERE is_active = TRUE'
      );
      
      const content = {};
      rows.forEach(row => {
        if (!content[row.section]) {
          content[row.section] = {};
        }
        
        let value = row.content_value;
        
        // Parse based on content type
        switch(row.content_type) {
          case 'number':
            value = parseInt(value);
            break;
          case 'boolean':
            value = value === 'true';
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch(e) {
              console.error('Error parsing JSON:', e);
            }
            break;
        }
        
        content[row.section][row.content_key] = value;
      });
      
      return content;
    } catch (error) {
      console.error('Error getting all content for frontend:', error);
      throw error;
    }
  }

  // Get single content item
  static async getById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM sph_content WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting content by id:', error);
      throw error;
    }
  }

  // Create new content
  static async create(contentData) {
    try {
      const { section, content_key, content_value, content_type = 'text', description = '' } = contentData;
      
      // Convert value to string based on type
      let valueToStore = content_value;
      if (content_type === 'json') {
        valueToStore = JSON.stringify(content_value);
      } else if (content_type === 'boolean') {
        valueToStore = content_value ? 'true' : 'false';
      } else {
        valueToStore = String(content_value);
      }
      
      const [result] = await db.execute(
        'INSERT INTO sph_content (section, content_key, content_value, content_type, description) VALUES (?, ?, ?, ?, ?)',
        [section, content_key, valueToStore, content_type, description]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  // Update content
  static async update(id, contentData) {
    try {
      const { content_value } = contentData;
      
      // Convert value to string based on type  
      let valueToStore = String(content_value);
      
      const [result] = await db.execute(
        'UPDATE sph_content SET content_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [valueToStore, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  // Delete content (soft delete by setting is_active to false)
  static async delete(id) {
    try {
      const [result] = await db.execute(
        'UPDATE sph_content SET is_active = FALSE WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  // Get all sections
  static async getSections() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT section FROM sph_content WHERE is_active = TRUE ORDER BY section'
      );
      return rows.map(row => row.section);
    } catch (error) {
      console.error('Error getting sections:', error);
      throw error;
    }
  }

  // Bulk update content for a section
  static async bulkUpdateSection(section, contentItems) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const item of contentItems) {
        let valueToStore = item.content_value;
        if (item.content_type === 'json') {
          valueToStore = JSON.stringify(item.content_value);
        } else if (item.content_type === 'boolean') {
          valueToStore = item.content_value ? 'true' : 'false';
        } else {
          valueToStore = String(item.content_value);
        }
        
        await connection.execute(
          `UPDATE sph_content 
           SET content_value = ?, content_type = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [valueToStore, item.content_type, item.description, item.id]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error bulk updating section:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = SphContentModel;