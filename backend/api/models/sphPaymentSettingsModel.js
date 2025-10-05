const db = require('../utils/db');

class SPHPaymentSettingsModel {
  // Get all payment settings
  static async getAllSettings() {
    try {
      const [rows] = await db.execute('SELECT * FROM sph_payment_settings ORDER BY setting_key');
      return rows;
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      throw error;
    }
  }

  // Get settings as key-value object
  static async getSettingsObject() {
    try {
      const settings = await this.getAllSettings();
      const result = {};
      
      settings.forEach(setting => {
        let value = setting.setting_value;
        
        // Convert based on type
        switch (setting.setting_type) {
          case 'number':
            value = parseInt(value);
            break;
          case 'boolean':
            value = value === 'true';
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch (e) {
              console.warn(`Failed to parse JSON for ${setting.setting_key}`);
            }
            break;
          default:
            // Keep as string
            break;
        }
        
        result[setting.setting_key] = value;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting settings object:', error);
      throw error;
    }
  }

  // Get specific setting by key
  static async getSetting(key) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM sph_payment_settings WHERE setting_key = ?',
        [key]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  }

  // Update or create setting
  static async updateSetting(key, value, type = 'text', description = '') {
    try {
      const query = `
        INSERT INTO sph_payment_settings (setting_key, setting_value, setting_type, description)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value),
          setting_type = VALUES(setting_type),
          description = VALUES(description),
          updated_at = CURRENT_TIMESTAMP
      `;
      
      const [result] = await db.execute(query, [key, value.toString(), type, description]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  // Update multiple settings at once
  static async updateMultipleSettings(settings) {
    try {
      const promises = settings.map(setting => 
        this.updateSetting(setting.key, setting.value, setting.type, setting.description)
      );
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  }

  // Delete setting
  static async deleteSetting(key) {
    try {
      const [result] = await db.execute(
        'DELETE FROM sph_payment_settings WHERE setting_key = ?',
        [key]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting setting:', error);
      throw error;
    }
  }

  // Get pricing information for frontend
  static async getPricingInfo() {
    try {
      const settings = await this.getSettingsObject();
      return {
        general: settings.price_general || 150000,
        student: settings.price_student || 100000,
        qris_enabled: settings.qris_enabled || true,
        manual_enabled: settings.payment_method_manual || true
      };
    } catch (error) {
      console.error('Error getting pricing info:', error);
      throw error;
    }
  }

  // Get bank information for frontend
  static async getBankInfo() {
    try {
      const settings = await this.getSettingsObject();
      return {
        bank_name: settings.bank_name || 'Bank Mandiri',
        account_number: settings.bank_account_number || '1234567890',
        account_name: settings.bank_account_name || 'Himperra Lampung',
        instructions: settings.payment_instructions || 'Transfer ke rekening di atas dan konfirmasi pembayaran',
        contact_admin: settings.contact_admin || '+62 812-3456-7890'
      };
    } catch (error) {
      console.error('Error getting bank info:', error);
      throw error;
    }
  }
}

module.exports = SPHPaymentSettingsModel;