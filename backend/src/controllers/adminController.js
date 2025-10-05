// adminController.js
const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');

exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.getAllAdmins();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data admin' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    console.log('BODY:', req.body); // Debug log
    const { username, nama, email, role, status, password, twoFactorEnabled, avatar } = req.body;
    if (!username || !nama || !email || !role || !password) return res.status(400).json({ error: 'Data wajib diisi' });
    await Admin.createAdmin({ username, nama, email, role, status: status || 'active', password, twoFactorEnabled, avatar });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat admin' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nama, email, role, status, password, twoFactorEnabled, avatar } = req.body;
    await Admin.updateAdmin(id, { username, nama, email, role, status, password, twoFactorEnabled, avatar });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal update admin' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await Admin.deleteAdmin(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal hapus admin' });
  }
};

exports.listActivities = async (req, res) => {
  // Dummy log, replace with real log from DB if available
  res.json([
    { id: 1, admin: 'Ahmad Hidayat', action: 'Created new participant', time: '10 minutes ago' },
    { id: 2, admin: 'Siti Rahman', action: 'Updated agenda item', time: '25 minutes ago' },
    { id: 3, admin: 'Budi Santoso', action: 'Approved participant registration', time: '1 hour ago' },
    { id: 4, admin: 'Ahmad Hidayat', action: 'Modified system settings', time: '2 hours ago' },
    { id: 5, admin: 'Siti Rahman', action: 'Published new content', time: '3 hours ago' }
  ]);
};
