const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminMiddleware, authMiddleware } = require('../middleware/authMiddleware');
const { runMigrations } = require('../../scripts/run-sql-migrations');


// List all admins
router.get('/admins', authMiddleware, adminMiddleware, adminController.listAdmins);
// Create admin
router.post('/admins', authMiddleware, adminMiddleware, adminController.createAdmin);
// Update admin
router.put('/admins/:id', authMiddleware, adminMiddleware, adminController.updateAdmin);
// Delete admin
router.delete('/admins/:id', authMiddleware, adminMiddleware, adminController.deleteAdmin);
// List activities
router.get('/admins/activities', authMiddleware, adminMiddleware, adminController.listActivities);

// Tambah endpoint aman untuk trigger migrasi manual & status oleh admin (super user)
router.post('/migrations/run', authMiddleware, adminMiddleware, async (req, res) => {
	try {
		if (process.env.ALLOW_MANUAL_MIGRATION !== '1') {
			return res.status(403).json({ message: 'Manual migration disabled' });
		}
		const result = await runMigrations({ apply: true, force: false, logger: console });
		res.json({ message: 'Migrations executed', stats: result?.stats });
	} catch (e) {
		res.status(500).json({ message: 'Migration error', error: e.message });
	}
});

router.get('/migrations/status', authMiddleware, adminMiddleware, async (req, res) => {
	try {
		// Lightweight status: attempt simple query and list existing admin table
		const { dbPromise } = require('../utils/db');
		const [rows] = await dbPromise.query("SHOW TABLES LIKE 'admins'");
		const hasAdmins = rows.length > 0;
		res.json({
			migrations: {
				adminsTable: hasAdmins ? 'present' : 'missing'
			},
			allowManual: process.env.ALLOW_MANUAL_MIGRATION === '1'
		});
	} catch (e) {
		res.status(500).json({ message: 'Status error', error: e.message });
	}
});

module.exports = router;
