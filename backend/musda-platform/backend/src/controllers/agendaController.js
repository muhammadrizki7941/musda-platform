const Agenda = require('../models/agendaModel');
const User = require('../models/User');

function extractDatePart(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const m = String(value).match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function toBit(v, fallback = 1) { return (v === true || v === 1 || v === '1') ? 1 : (v === false || v === 0 || v === '0') ? 0 : fallback; }

exports.createAgenda = async (req, res) => {
  const { title, description, startTime, endTime, date, location, speaker, is_active } = req.body;
  const cleanedDate = extractDatePart(date);
  if (!title || !startTime || !endTime || !cleanedDate) {
    return res.status(400).json({ error: 'Judul, waktu mulai, waktu selesai, dan tanggal wajib diisi (format tanggal YYYY-MM-DD)' });
  }
  try {
    const result = await Agenda.create({
      title: String(title).trim(),
      description: description || '',
      startTime,
      endTime,
      date: cleanedDate,
      location: location || '',
      speaker: speaker || '',
      is_active: toBit(is_active, 1)
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
    // map snake_case to camelCase for consistency
    const mapped = {
      id: agenda.id,
      title: agenda.title,
      description: agenda.description,
      startTime: agenda.start_time,
      endTime: agenda.end_time,
      date: agenda.agenda_date,
      location: agenda.location,
      speaker: agenda.speaker,
      is_active: agenda.is_active,
      created_at: agenda.created_at,
      updated_at: agenda.updated_at
    };
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data agenda' });
  }
};

exports.listAgendas = async (req, res) => {
  try {
    const agendas = await Agenda.list();
    const mapped = agendas.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      startTime: a.start_time,
      endTime: a.end_time,
      date: a.agenda_date,
      location: a.location,
      speaker: a.speaker,
      is_active: a.is_active,
      created_at: a.created_at,
      updated_at: a.updated_at
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Error listing agendas:', err);
    res.status(500).json({ error: 'Gagal ambil daftar agenda' });
  }
};

exports.updateAgenda = async (req, res) => {
  const id = req.params.id;
  const { title, description, startTime, endTime, date, location, speaker, is_active } = req.body;
  const cleanedDate = extractDatePart(date);
  if (!title || !startTime || !endTime || !cleanedDate) {
    return res.status(400).json({ error: 'Judul, waktu mulai, waktu selesai, dan tanggal wajib diisi (format tanggal YYYY-MM-DD)' });
  }
  try {
    await Agenda.update(id, {
      title: String(title).trim(),
      description: description || '',
      startTime,
      endTime,
      date: cleanedDate,
      location: location || '',
      speaker: speaker || '',
      is_active: toBit(is_active, 1)
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
