const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { dbPromise } = require('../utils/db');

// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Get various counts
  const [participants] = await dbPromise.execute('SELECT COUNT(*) as count FROM guests');
  const [sphParticipants] = await dbPromise.execute('SELECT COUNT(*) as count FROM sph_participants');
  const [agendas] = await dbPromise.execute('SELECT COUNT(*) as count FROM agendas');
  const [sponsors] = await dbPromise.execute('SELECT COUNT(*) as count FROM sponsors');
  const [admins] = await dbPromise.execute('SELECT COUNT(*) as count FROM users WHERE role IN ("admin", "panitia")');
    
    // Get recent activities (sample data for now)
    const stats = {
      totalParticipants: participants[0].count,
      sphParticipants: sphParticipants[0].count,
      totalAgendas: agendas[0].count,
      totalSponsors: sponsors[0].count,
      totalAdmins: admins[0].count,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Get detailed reports
router.get('/detailed', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get participant trends (last 30 days)
    const [participantTrends] = await dbPromise.execute(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM guests 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    // Get sponsor breakdown by tier
    const [sponsorBreakdown] = await dbPromise.execute(`
      SELECT category, COUNT(*) as count 
      FROM sponsors 
      GROUP BY category
    `);
    
    // Get recent registrations
    const [recentRegistrations] = await dbPromise.execute(`
      SELECT id, nama, email, created_at 
      FROM guests 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    const report = {
      participantTrends,
      sponsorBreakdown,
      recentRegistrations,
      generatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating detailed report',
      error: error.message
    });
  }
});

// Export data as CSV
router.get('/export/:type', authMiddleware, adminMiddleware, async (req, res) => {
  try {
  const { type } = req.params;
    
    let query, filename;
    
    switch (type) {
      case 'participants':
        query = 'SELECT * FROM guests ORDER BY created_at DESC';
        filename = 'participants.csv';
        break;
      case 'sph-participants':
        query = 'SELECT * FROM sph_participants ORDER BY created_at DESC';
        filename = 'sph_participants.csv';
        break;
      case 'sponsors':
        query = 'SELECT * FROM sponsors ORDER BY created_at DESC';
        filename = 'sponsors.csv';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }
    
  const [rows] = await dbPromise.execute(query);
    
    if (rows.length === 0) {
      return res.json({
        success: false,
        message: 'No data to export'
      });
    }
    
    // Convert to CSV
    const headers = Object.keys(rows[0]).join(',');
    const csvData = rows.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    ).join('\n');
    
    const csv = headers + '\n' + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data',
      error: error.message
    });
  }
});

module.exports = router;