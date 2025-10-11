const Sponsor = require('../models/sponsorModel');
const User = require('../models/User');

exports.createSponsor = async (req, res) => {
  let { name, logo, logo_path, category, website_url, sort_order, is_active } = req.body || {};
  name = typeof name === 'string' ? name.trim() : name;
  category = typeof category === 'string' ? category.trim() : category;
  if (!name || !category) {
    return res.status(400).json({ error: 'Nama dan kategori sponsor wajib diisi' });
  }
  try {
    const result = await Sponsor.create({ 
      name, 
      logo_path: logo_path || logo, 
      category, 
      website_url,
      sort_order: sort_order || 0,
      is_active: typeof is_active === 'number' ? is_active : 1
    });
    const created = await Sponsor.findById(result.insertId);
    res.json({ success: true, data: created });
  } catch (err) {
    console.error('Create sponsor error:', err);
    res.status(500).json({ error: 'Gagal tambah sponsor' });
  }
};

exports.getSponsor = async (req, res) => {
  const id = req.params.id;
  try {
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) return res.status(404).json({ error: 'Sponsor tidak ditemukan' });
    res.json({ success: true, data: sponsor });
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil data sponsor' });
  }
};

exports.listSponsors = async (req, res) => {
  const { category } = req.query;
  try {
    const sponsors = await Sponsor.list(category);
    res.json({ success: true, data: sponsors });
  } catch (err) {
    res.status(500).json({ error: 'Gagal ambil daftar sponsor' });
  }
};

exports.updateSponsor = async (req, res) => {
  const id = req.params.id;
  let { name, logo, logo_path, category, website_url, sort_order, is_active } = req.body || {};
  name = typeof name === 'string' ? name.trim() : name;
  category = typeof category === 'string' ? category.trim() : category;
  if (!name || !category) {
    return res.status(400).json({ error: 'Nama dan kategori sponsor wajib diisi' });
  }
  try {
    // Get old sponsor data
    const oldSponsor = await Sponsor.findById(id);
    const newLogoPath = logo_path || logo;
    if (oldSponsor && oldSponsor.logo_path && newLogoPath && oldSponsor.logo_path !== newLogoPath) {
      // Delete old logo file if exists and not same as new
      const fs = require('fs');
      const path = require('path');
      const oldPath = path.join(__dirname, '../../uploads/sponsor-logos', path.basename(oldSponsor.logo_path));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    const result = await Sponsor.update(id, { 
      name, 
      logo_path: newLogoPath, 
      category, 
      website_url,
      sort_order: sort_order || 0,
      is_active: typeof is_active === 'number' ? is_active : oldSponsor?.is_active ?? 1
    });
    const updated = await Sponsor.findById(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update sponsor error:', err);
    res.status(500).json({ error: 'Gagal update sponsor' });
  }
};

exports.deleteSponsor = async (req, res) => {
  const id = req.params.id;
  try {
    await Sponsor.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal hapus sponsor' });
  }
};
