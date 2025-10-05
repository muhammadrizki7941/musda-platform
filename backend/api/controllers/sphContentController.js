const SphContentModel = require('../models/sphContentModel');

class SphContentController {
  // Get all content for frontend
  static async getFrontendContent(req, res) {
    try {
      const content = await SphContentModel.getAllForFrontend();
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error getting frontend content:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving content'
      });
    }
  }

  // Get content by section for admin
  static async getContentBySection(req, res) {
    try {
      const { section } = req.params;
      const content = await SphContentModel.getBySection(section);
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error getting content by section:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving content'
      });
    }
  }

  // Get all sections
  static async getSections(req, res) {
    try {
      const sections = await SphContentModel.getSections();
      res.json({
        success: true,
        data: sections
      });
    } catch (error) {
      console.error('Error getting sections:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving sections'
      });
    }
  }

  // Get single content item
  static async getContentById(req, res) {
    try {
      const { id } = req.params;
      const content = await SphContentModel.getById(id);
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }
      
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error getting content by id:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving content'
      });
    }
  }

  // Create new content
  static async createContent(req, res) {
    try {
      const { section, content_key, content_value, content_type, description } = req.body;
      
      if (!section || !content_key || content_value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Section, content_key, and content_value are required'
        });
      }
      
      const contentId = await SphContentModel.create({
        section,
        content_key,
        content_value,
        content_type: content_type || 'text',
        description: description || ''
      });
      
      res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: { id: contentId }
      });
    } catch (error) {
      console.error('Error creating content:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({
          success: false,
          message: 'Content key already exists in this section'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error creating content'
        });
      }
    }
  }

  // Update content
  static async updateContent(req, res) {
    try {
      const { id } = req.params;
      const { content_value, content_type, description } = req.body;
      
      if (content_value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'content_value is required'
        });
      }
      
      const updated = await SphContentModel.update(id, {
        content_value,
        content_type: content_type || 'text',
        description: description || ''
      });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Content updated successfully'
      });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating content'
      });
    }
  }

  // Delete content
  static async deleteContent(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await SphContentModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting content'
      });
    }
  }

  // Bulk update content for a section
  static async bulkUpdateSection(req, res) {
    try {
      const { section } = req.params;
      const { contentItems } = req.body;
      
      if (!Array.isArray(contentItems)) {
        return res.status(400).json({
          success: false,
          message: 'contentItems must be an array'
        });
      }
      
      await SphContentModel.bulkUpdateSection(section, contentItems);
      
      res.json({
        success: true,
        message: 'Section content updated successfully'
      });
    } catch (error) {
      console.error('Error bulk updating section:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating section content'
      });
    }
  }
}

module.exports = SphContentController;