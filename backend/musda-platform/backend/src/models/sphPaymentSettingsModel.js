const { dbPromise: db } = require('../utils/db');

async function tableExists() {
  try {
    const [rows] = await db.execute("SHOW TABLES LIKE 'sph_payment_settings'");
    return rows && rows.length > 0;
  } catch (_) {
    return false;
  }
}

class SPHPaymentSettingsModel {
  // Get all payment settings
  static async getAllSettings() {
    try {
      if (!(await tableExists())) {
        // No settings table yet; return empty to allow callers to use defaults
        return [];
      }
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
      if (!(await tableExists())) return null;
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
      if (!(await tableExists())) {
        // Attempt to create minimal table automatically
        await db.execute(`
          CREATE TABLE IF NOT EXISTS sph_payment_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(191) NOT NULL UNIQUE,
            setting_value TEXT,
            setting_type ENUM('text','number','boolean','json') DEFAULT 'text',
            description VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
      }
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
        qris_enabled: false, // enforced off
        manual_enabled: settings.payment_method_manual !== false, // default true
        is_free: !!settings.is_free
      };
    } catch (error) {
      // If settings table missing or read fails, return safe defaults rather than throwing
      console.warn('Pricing info fallback to defaults due to error:', error?.message);
      return {
        general: 150000,
        student: 100000,
        qris_enabled: false,
        manual_enabled: true,
        is_free: false
      };
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
      console.warn('Bank info fallback to defaults due to error:', error?.message);
      return {
        bank_name: 'Bank Mandiri',
        account_number: '1234567890',
        account_name: 'Himperra Lampung',
        instructions: 'Transfer ke rekening di atas dan konfirmasi pembayaran',
        contact_admin: '+62 812-3456-7890'
      };
    }
  }
}

module.exports = SPHPaymentSettingsModel;