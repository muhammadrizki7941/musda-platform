
const db = require('../utils/db');
const bcrypt = require('bcryptjs');

const getAllAdmins = async () => {
  // Ambil semua user dengan role admin/super_admin/moderator/viewer
  const [rows] = await db.query("SELECT * FROM users WHERE role IN ('super_admin','admin','moderator','viewer')");
  return rows;
};

const getAdminById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ? AND role IN ('super_admin','admin','moderator','viewer')", [id]);
  return rows[0];
};

const createAdmin = async (admin) => {
  const { username, nama, email, role, status, password, twoFactorEnabled, avatar } = admin;
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (username, nama, email, role, status, password, twoFactorEnabled, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [username, nama, email, role, status || 'active', hash, twoFactorEnabled || false, avatar || null]
  );
};

const updateAdmin = async (id, admin) => {
  const { username, nama, email, role, status, password, twoFactorEnabled, avatar } = admin;
  let hash = password;
  if (password && password.length < 40) hash = await bcrypt.hash(password, 10);
  await db.query(
    'UPDATE users SET username=?, nama=?, email=?, role=?, status=?, password=?, twoFactorEnabled=?, avatar=? WHERE id=?',
    [username, nama, email, role, status, hash, twoFactorEnabled, avatar, id]
  );
};

const deleteAdmin = async (id) => {
  await db.query("DELETE FROM users WHERE id=? AND role IN ('super_admin','admin','moderator','viewer')", [id]);
};

module.exports = { getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin };
