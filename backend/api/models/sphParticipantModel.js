const db = require('../utils/db');

class SPHParticipantModel {
  // Get all SPH participants
  static async getAllParticipants() {
    const query = `
      SELECT 
        id,
        full_name,
        email,
        phone,
        institution,
        experience_level,
        payment_status,
        payment_method,
        payment_code,
        registration_date,
        payment_date,
        qr_code_path,
        notes
      FROM sph_participants 
      ORDER BY registration_date DESC
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error fetching SPH participants:', error);
      throw error;
    }
  }

  // Get SPH participant by ID
  static async getParticipantById(id) {
    const query = `
      SELECT 
        id,
        full_name,
        email,
        phone,
        institution,
        experience_level,
        payment_status,
        payment_method,
        payment_code,
        registration_date,
        payment_date,
        qr_code_path,
        notes
      FROM sph_participants 
      WHERE id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching SPH participant by ID:', error);
      throw error;
    }
  }

  // Create new SPH participant
  static async createParticipant(participantData) {
    const {
      full_name,
      email,
      phone,
      institution,
      experience_level,
      payment_method,
      payment_code
    } = participantData;

    const query = `
      INSERT INTO sph_participants (
        full_name,
        email,
        phone,
        institution,
        experience_level,
        payment_method,
        payment_code,
        payment_status,
        registration_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    
    try {
      const [result] = await db.execute(query, [
        full_name,
        email,
        phone,
        institution || null,  // Handle NULL for optional fields
        experience_level || 'pemula',
        payment_method || 'qris',
        payment_code
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating SPH participant:', error);
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(id, status) {
    const query = `
      UPDATE sph_participants 
      SET payment_status = ?, 
          payment_date = ${status === 'paid' ? 'NOW()' : 'payment_date'}
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [status, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Update QR code path
  static async updateQRCode(id, qrCodePath) {
    const query = `
      UPDATE sph_participants 
      SET qr_code_path = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [qrCodePath, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating QR code path:', error);
      throw error;
    }
  }

  // Check if email already exists
  static async checkEmailExists(email) {
    const query = 'SELECT id FROM sph_participants WHERE email = ?';
    
    try {
      const [rows] = await db.execute(query, [email]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking email exists:', error);
      throw error;
    }
  }

  // Get participant count by status
  static async getParticipantCountByStatus() {
    const query = `
      SELECT 
        payment_status,
        COUNT(*) as count
      FROM sph_participants 
      GROUP BY payment_status
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting participant count by status:', error);
      throw error;
    }
  }

  // Get total registered participants count
  static async getTotalParticipants() {
    const query = 'SELECT COUNT(*) as total FROM sph_participants';
    
    try {
      const [rows] = await db.execute(query);
      return rows[0].total;
    } catch (error) {
      console.error('Error getting total participants:', error);
      throw error;
    }
  }

  // Get paid participants count
  static async getPaidParticipants() {
    const query = "SELECT COUNT(*) as total FROM sph_participants WHERE payment_status = 'paid'";
    
    try {
      const [rows] = await db.execute(query);
      return rows[0].total;
    } catch (error) {
      console.error('Error getting paid participants:', error);
      throw error;
    }
  }

  // Update participant notes
  static async updateNotes(id, notes) {
    const query = `
      UPDATE sph_participants 
      SET notes = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [notes, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating participant notes:', error);
      throw error;
    }
  }

  // Delete participant
  static async deleteParticipant(id) {
    const query = 'DELETE FROM sph_participants WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  }

  // Get participants registered in last 7 days
  static async getRecentParticipants(days = 7) {
    const query = `
      SELECT 
        id,
        full_name,
        email,
        payment_status,
        registration_date
      FROM sph_participants 
      WHERE registration_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY registration_date DESC
    `;
    
    try {
      const [rows] = await db.execute(query, [days]);
      return rows;
    } catch (error) {
      console.error('Error getting recent participants:', error);
      throw error;
    }
  }
}

module.exports = SPHParticipantModel;