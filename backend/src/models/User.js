const { dbPromise: db } = require('../utils/db');
const bcrypt = require('bcrypt');

const User = {
  findByUsername: async (username) => {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (user) => {
    const hash = await bcrypt.hash(user.password, 10);
    const [result] = await db.query('INSERT INTO users (username, password, role, nama, email) VALUES (?, ?, ?, ?, ?)', [user.username, hash, user.role, user.nama, user.email]);
    return result.insertId;
  }
};

module.exports = User;
