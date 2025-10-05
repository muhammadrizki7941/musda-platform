const PosterModel = require('../models/posterModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for poster uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/poster-flyers');
        // Create directory if it doesn't exist
        const fs = require('fs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
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
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

const posterController = {
    // Get all active posters for public
    async getActivePosters(req, res) {
        try {
            console.log('📋 Getting active posters...');
            const posters = await PosterModel.getAllPosters();
            
            console.log(`✅ Found ${posters.length} active posters`);
            res.json({
                success: true,
                data: posters
            });
        } catch (error) {
            console.error('❌ Error getting active posters:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data poster'
            });
        }
    },

    // Get all posters for admin
    async getAllPostersAdmin(req, res) {
        try {
            console.log('🔧 Admin getting all posters...');
            const posters = await PosterModel.getAllPostersAdmin();
            
            console.log(`✅ Found ${posters.length} total posters for admin`);
            res.json({
                success: true,
                data: posters
            });
        } catch (error) {
            console.error('❌ Error getting admin posters:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data poster untuk admin'
            });
        }
    },

    // Get poster by ID
    async getPosterById(req, res) {
        try {
            const { id } = req.params;
            console.log(`🔍 Getting poster by ID: ${id}`);
            
            const poster = await PosterModel.getPosterById(id);
            
            if (!poster) {
                return res.status(404).json({
                    success: false,
                    message: 'Poster tidak ditemukan'
                });
            }

            console.log(`✅ Found poster: ${poster.title}`);
            res.json({
                success: true,
                data: poster
            });
        } catch (error) {
            console.error('❌ Error getting poster by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data poster'
            });
        }
    },

    // Get upload middleware
    getUploadMiddleware() {
        return upload.single('image');
    },

    // Upload image endpoint
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            console.log('📁 File uploaded:', req.file.filename);
            const imageUrl = `/uploads/poster-flyers/${req.file.filename}`;
            console.log('🖼️ Image URL:', imageUrl);
            
            res.json({ 
                success: true,
                url: imageUrl 
            });
        } catch (error) {
            console.error('❌ Upload image error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Server error', 
                error: error.message 
            });
        }
    },

    // Create new poster
    async createPoster(req, res) {
        try {
            const { title, description, image_url } = req.body;
            console.log('📝 Creating new poster:', { title, description, image_url: image_url ? 'URL provided' : 'No URL' });

            // Validate required fields
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Judul poster wajib diisi'
                });
            }

            let finalImageUrl = image_url;

            // If file was uploaded, use uploaded file path
            if (req.file) {
                finalImageUrl = `/uploads/poster-flyers/${req.file.filename}`;
                console.log(`📁 Using uploaded file: ${finalImageUrl}`);
            }

            if (!finalImageUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'Gambar poster wajib diupload atau URL gambar harus diisi'
                });
            }

            const posterData = {
                image_url: finalImageUrl,
                title,
                description: description || ''
            };

            const posterId = await PosterModel.createPoster(posterData);
            
            console.log(`✅ Poster created successfully with ID: ${posterId}`);
            res.status(201).json({
                success: true,
                message: 'Poster berhasil dibuat',
                data: {
                    id: posterId,
                    ...posterData
                }
            });
        } catch (error) {
            console.error('❌ Error creating poster:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal membuat poster'
            });
        }
    },

    // Update poster
    async updatePoster(req, res) {
        try {
            const { id } = req.params;
            const { title, description, image_url, is_active } = req.body;
            console.log(`✏️ Updating poster ${id}:`, { title, description, is_active });

            // Get existing poster
            const existingPoster = await PosterModel.getPosterById(id);
            if (!existingPoster) {
                return res.status(404).json({
                    success: false,
                    message: 'Poster tidak ditemukan'
                });
            }

            let finalImageUrl = image_url || existingPoster.image_url;

            // If new file was uploaded, use uploaded file path
            if (req.file) {
                finalImageUrl = `/uploads/poster-flyers/${req.file.filename}`;
                console.log(`📁 Using new uploaded file: ${finalImageUrl}`);
                
                // Delete old file if it was locally uploaded
                if (existingPoster.image_url && existingPoster.image_url.startsWith('/uploads/')) {
                    const oldFilePath = path.join(__dirname, '../../', existingPoster.image_url);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                        console.log(`🗑️ Deleted old file: ${oldFilePath}`);
                    }
                }
            }

            const posterData = {
                image_url: finalImageUrl,
                title: title || existingPoster.title,
                description: description !== undefined ? description : existingPoster.description,
                is_active: is_active !== undefined ? is_active : existingPoster.is_active
            };

            const success = await PosterModel.updatePoster(id, posterData);
            
            if (success) {
                console.log(`✅ Poster ${id} updated successfully`);
                res.json({
                    success: true,
                    message: 'Poster berhasil diperbarui',
                    data: {
                        id,
                        ...posterData
                    }
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Poster tidak ditemukan atau tidak ada perubahan'
                });
            }
        } catch (error) {
            console.error('❌ Error updating poster:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal memperbarui poster'
            });
        }
    },

    // Delete poster
    async deletePoster(req, res) {
        try {
            const { id } = req.params;
            console.log(`🗑️ Deleting poster ${id}...`);

            // Get poster to check for local file
            const poster = await PosterModel.getPosterById(id);
            if (!poster) {
                return res.status(404).json({
                    success: false,
                    message: 'Poster tidak ditemukan'
                });
            }

            // Delete from database (hard delete)
            const success = await PosterModel.hardDelete(id);
            
            if (success) {
                // Delete file if it was locally uploaded
                if (poster.image_url && poster.image_url.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, '../../', poster.image_url);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`🗑️ Deleted file: ${filePath}`);
                    }
                }

                console.log(`✅ Poster ${id} deleted successfully from database and filesystem`);
                res.json({
                    success: true,
                    message: 'Poster berhasil dihapus'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Poster tidak ditemukan'
                });
            }
        } catch (error) {
            console.error('❌ Error deleting poster:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal menghapus poster'
            });
        }
    },

    // Toggle poster status
    async togglePosterStatus(req, res) {
        try {
            const { id } = req.params;
            console.log(`🔄 Toggling status for poster ${id}...`);

            const success = await PosterModel.toggleStatus(id);
            
            if (success) {
                console.log(`✅ Poster ${id} status toggled successfully`);
                res.json({
                    success: true,
                    message: 'Status poster berhasil diubah'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Poster tidak ditemukan'
                });
            }
        } catch (error) {
            console.error('❌ Error toggling poster status:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengubah status poster'
            });
        }
    },

    // Get poster statistics
    async getPosterStats(req, res) {
        try {
            console.log('📊 Getting poster statistics...');
            
            const allPosters = await PosterModel.getAllPostersAdmin();
            const activeCount = await PosterModel.getActivePosterCount();
            
            const stats = {
                total: allPosters.length,
                active: activeCount,
                inactive: allPosters.length - activeCount
            };

            console.log('✅ Poster statistics:', stats);
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('❌ Error getting poster statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil statistik poster'
            });
        }
    }
};

module.exports = posterController;