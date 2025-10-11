const { dbPromise: db } = require('../utils/db');

class SPHSettingsModel {
  // Get SPH settings
  static async getSettings() {
    try {
      const [rows] = await db.execute('SELECT * FROM sph_settings ORDER BY id DESC LIMIT 1');
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update SPH settings
  static async updateSettings(settings) {
    try {
      const { countdown_target_date, max_participants, current_participants, registration_open } = settings;
      
      // Check if settings exist
      const existing = await this.getSettings();
      
      if (existing) {
        // Update existing
        const [result] = await db.execute(
          'UPDATE sph_settings SET countdown_target_date = ?, max_participants = ?, current_participants = ?, registration_open = ? WHERE id = ?',
          [countdown_target_date, max_participants, current_participants, registration_open, existing.id]
        );
        return result;
      } else {
        // Insert new
        const [result] = await db.execute(
          'INSERT INTO sph_settings (countdown_target_date, max_participants, current_participants, registration_open) VALUES (?, ?, ?, ?)',
          [countdown_target_date, max_participants, current_participants, registration_open]
        );
        return result;
      }
    } catch (error) {
      throw error;
    }
  }

  // Get current participant count from database
  static async getCurrentParticipantCount() {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as count FROM sph_participants WHERE payment_status = "paid"');
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Update participant count
  static async updateParticipantCount() {
    try {
      const count = await this.getCurrentParticipantCount();
      const settings = await this.getSettings();
      
      if (settings) {
        await db.execute(
          'UPDATE sph_settings SET current_participants = ? WHERE id = ?',
          [count, settings.id]
        );
      }
      
      return count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SPHSettingsModel;