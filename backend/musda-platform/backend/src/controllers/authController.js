const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { dbPromise } = require('../utils/db');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;  // Kembali ke username
    
    // Cari admin di tabel admins berdasarkan username
    const [rows] = await dbPromise.query('SELECT * FROM admins WHERE username = ?', [username]);
    const user = rows[0];
    
    if (!user) return res.status(401).json({ message: 'User tidak ditemukan' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Password salah' });
    
    // Update last login
    await dbPromise.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [user.id]);
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET || 'musda_secret', 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        name: user.name,
        email: user.email
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    // Cari admin di tabel admins
    const [rows] = await dbPromise.query('SELECT * FROM admins WHERE id = ?', [req.user.id]);
    const user = rows[0];
    
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    
    res.json({ 
      id: user.id, 
      username: user.username, 
      role: user.role, 
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.register = async (req, res) => {
  const { username, password, role, nama, email } = req.body;
  if (!username || !password || !role) return res.status(400).json({ message: 'Data wajib diisi' });
  const existing = await User.findByUsername(username);
  if (existing) return res.status(400).json({ message: 'Username sudah digunakan' });
  const id = await User.create({ username, password, role, nama, email });
  res.json({ id });
};
