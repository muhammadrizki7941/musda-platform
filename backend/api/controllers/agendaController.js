const Agenda = require('../models/agendaModel');
const User = require('../models/User');

exports.createAgenda = async (req, res) => {
  const { title, description, startTime, endTime, date, location, speaker, is_active } = req.body;
  if (!title || !startTime || !endTime || !date) {
    return res.status(400).json({ error: 'Judul, waktu mulai, waktu selesai, dan tanggal wajib diisi' });
  }
  try {
    const result = await Agenda.create({ 
      title, 
      description, 
      startTime, 
      endTime, 
      date, 
      location, 
      speaker, 
      is_active: is_active !== undefined ? is_active : 1
    });
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error creating agenda:', err);
    res.status(500).json({ error: 'Gagal tambah agenda' });
  }
};

exports.getAgenda = async (req, res) => {
  const id = req.params.id;
  try {
    const agenda = await Agenda.findById(id);
    if (!agenda) return res.status(404).json({ error: 'Agenda tidak ditemukan' });
    res.json(agenda);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data agenda' });
  }
};

exports.listAgendas = async (req, res) => {
  try {
    const agendas = await Agenda.list();
    res.json(agendas);
  } catch (err) {
    console.error('Error listing agendas:', err);
    res.status(500).json({ error: 'Gagal ambil daftar agenda' });
  }
};

exports.updateAgenda = async (req, res) => {
  const id = req.params.id;
  const { title, description, startTime, endTime, date, location, speaker, is_active } = req.body;
  if (!title || !startTime || !endTime || !date) {
    return res.status(400).json({ error: 'Judul, waktu mulai, waktu selesai, dan tanggal wajib diisi' });
  }
  try {
    await Agenda.update(id, { 
      title, 
      description, 
      startTime, 
      endTime, 
      date, 
      location, 
      speaker, 
      is_active: is_active !== undefined ? is_active : 1
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating agenda:', err);
    res.status(500).json({ error: 'Gagal update agenda' });
  }
};

exports.deleteAgenda = async (req, res) => {
  const id = req.params.id;
  try {
    await Agenda.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal hapus agenda' });
  }
};
