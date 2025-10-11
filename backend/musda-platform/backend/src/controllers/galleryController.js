const galleryModel = require('../models/galleryModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/gallery');
    // Create directory if it doesn't exist
    fs.mkdir(uploadPath, { recursive: true }).then(() => {
      cb(null, uploadPath);
    }).catch(err => {
      cb(err);
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const galleryController = {
  // Get all gallery items for public display
  async getGalleryItems(req, res) {
    try {
      const items = await galleryModel.getAll();
      res.json(items);
    } catch (error) {
      console.error('Get gallery items error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all gallery items for admin (including inactive)
  async getGalleryItemsForAdmin(req, res) {
    try {
      const items = await galleryModel.getAllForAdmin();
      res.json(items);
    } catch (error) {
      console.error('Get gallery items for admin error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get gallery item by ID
  async getGalleryItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await galleryModel.getById(id);
      
      if (!item) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      
      res.json(item);
    } catch (error) {
      console.error('Get gallery item by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create new gallery item
  async createGalleryItem(req, res) {
    try {
      const { image_url, description, sort_order } = req.body;

      if (!image_url || !description) {
        return res.status(400).json({ message: 'Image URL and description are required' });
      }

      // Get next sort order if not provided
      let finalSortOrder = sort_order;
      if (!finalSortOrder) {
        const maxOrder = await galleryModel.getMaxSortOrder();
        finalSortOrder = maxOrder + 1;
      }

      const itemId = await galleryModel.create({
        image_url,
        description,
        sort_order: finalSortOrder
      });

      const newItem = await galleryModel.getById(itemId);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Create gallery item error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update gallery item
  async updateGalleryItem(req, res) {
    try {
      const { id } = req.params;
      const { image_url, description, sort_order, is_active } = req.body;

      const existingItem = await galleryModel.getById(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }

      const updated = await galleryModel.update(id, {
        image_url: image_url || existingItem.image_url,
        description: description || existingItem.description,
        sort_order: sort_order !== undefined ? sort_order : existingItem.sort_order,
        is_active: is_active !== undefined ? is_active : existingItem.is_active
      });

      if (!updated) {
        return res.status(400).json({ message: 'Failed to update gallery item' });
      }

      const updatedItem = await galleryModel.getById(id);
      res.json(updatedItem);
    } catch (error) {
      console.error('Update gallery item error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete gallery item (hard delete)
  async deleteGalleryItem(req, res) {
    try {
      const { id } = req.params;
      const fs = require('fs');
      const path = require('path');

      console.log('Deleting gallery item ID:', id);

      const existingItem = await galleryModel.getById(id);
      if (!existingItem) {
        console.log('Gallery item not found:', id);
        return res.status(404).json({ message: 'Gallery item not found' });
      }

      console.log('Found gallery item to delete:', existingItem);

      // Delete physical file if it's a local upload
      if (existingItem.image_url && existingItem.image_url.startsWith('/uploads/gallery/')) {
        const filePath = path.join(__dirname, '../../..', existingItem.image_url);
        console.log('Attempting to delete file:', filePath);
        
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('File deleted successfully:', filePath);
          }
        } catch (fileError) {
          console.error('Error deleting file:', fileError);
          // Continue with database deletion even if file deletion fails
        }
      }

      // Use hard delete to completely remove from database
      const deleted = await galleryModel.hardDelete(id);
      if (!deleted) {
        console.log('Failed to delete gallery item:', id);
        return res.status(400).json({ message: 'Failed to delete gallery item' });
      }

      console.log('Gallery item deleted successfully:', id);
      res.json({ 
        message: 'Gallery item deleted successfully',
        deletedItem: existingItem 
      });
    } catch (error) {
      console.error('Delete gallery item error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update sort order for multiple items
  async updateSortOrder(req, res) {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items array is required' });
      }

      await galleryModel.updateSortOrder(items);
      res.json({ message: 'Sort order updated successfully' });
    } catch (error) {
      console.error('Update sort order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Upload image
  async uploadImage(req, res) {
    try {
      console.log('Upload request received');
      console.log('File:', req.file);
      console.log('Body:', req.body);

      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
      }

      console.log('File uploaded:', req.file.filename);
      const imageUrl = `/uploads/gallery/${req.file.filename}`;
      console.log('Image URL:', imageUrl);
      
      res.json({ url: imageUrl });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get upload middleware
  getUploadMiddleware() {
    return upload.single('image');
  }
};

module.exports = galleryController;