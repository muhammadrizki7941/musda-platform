const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { dbPromise: db } = require('../utils/db');

// Setup sph_content table and initial data
router.post('/setup-content-table', async (req, res) => {
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/create_sph_content_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    res.json({
      success: true,
      message: 'SPH Content table and initial data setup completed',
      statements: statements.length
    });
    
  } catch (error) {
    console.error('Error setting up content table:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up content table',
      error: error.message
    });
  }
});

// Check content table status
router.get('/content-table-status', async (req, res) => {
  try {
    // Check if table exists
    const [tables] = await db.execute(
      "SHOW TABLES LIKE 'sph_content'"
    );
    
    if (tables.length === 0) {
      return res.json({
        success: true,
        tableExists: false,
        message: 'sph_content table does not exist'
      });
    }
    
    // Check data count
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM sph_content'
    );
    
    res.json({
      success: true,
      tableExists: true,
      recordCount: rows[0].count,
      message: `sph_content table exists with ${rows[0].count} records`
    });
    
  } catch (error) {
    console.error('Error checking content table:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking content table',
      error: error.message
    });
  }
});

module.exports = router;