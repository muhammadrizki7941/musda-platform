const db = require('../utils/db');

class PosterModel {
    // Get all active posters
    static async getAllPosters() {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM poster_flyers WHERE is_active = 1 ORDER BY created_at DESC'
            );
            return rows;
        } catch (error) {
            console.error('Error getting all posters:', error);
            throw error;
        }
    }

    // Get all posters for admin (including inactive)
    static async getAllPostersAdmin() {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM poster_flyers ORDER BY created_at DESC'
            );
            return rows;
        } catch (error) {
            console.error('Error getting all posters for admin:', error);
            throw error;
        }
    }

    // Get poster by ID
    static async getPosterById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM poster_flyers WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting poster by ID:', error);
            throw error;
        }
    }

    // Create new poster
    static async createPoster(posterData) {
        try {
            const { image_url, title, description } = posterData;
            const [result] = await db.execute(
                'INSERT INTO poster_flyers (image_url, title, description, is_active) VALUES (?, ?, ?, 1)',
                [image_url, title, description]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating poster:', error);
            throw error;
        }
    }

    // Update poster
    static async updatePoster(id, posterData) {
        try {
            const { image_url, title, description, is_active } = posterData;
            const [result] = await db.execute(
                'UPDATE poster_flyers SET image_url = ?, title = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [image_url, title, description, is_active, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating poster:', error);
            throw error;
        }
    }

    // Hard delete poster
    static async hardDelete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM poster_flyers WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error hard deleting poster:', error);
            throw error;
        }
    }

    // Toggle poster status
    static async toggleStatus(id) {
        try {
            const [result] = await db.execute(
                'UPDATE poster_flyers SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error toggling poster status:', error);
            throw error;
        }
    }

    // Get active poster count
    static async getActivePosterCount() {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM poster_flyers WHERE is_active = 1'
            );
            return rows[0].count;
        } catch (error) {
            console.error('Error getting active poster count:', error);
            throw error;
        }
    }
}

module.exports = PosterModel;