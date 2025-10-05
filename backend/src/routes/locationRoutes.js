const express = require('express');
const router = express.Router();
const { fetchProvinces, fetchCitiesByProvinceName, searchCities } = require('../services/locationService');

// GET /api/locations/provinces
router.get('/locations/provinces', async (req, res) => {
  try {
    const list = await fetchProvinces();
    res.json({ provinces: list.map(p => p.name) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load provinces' });
  }
});

// GET /api/locations/cities?province=Lampung
router.get('/locations/cities', async (req, res) => {
  const { province } = req.query;
  try {
    const cities = await fetchCitiesByProvinceName(province);
    res.json({ cities });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load cities' });
  }
});

// GET /api/locations/search-cities?q=ban&province=Lampung
router.get('/locations/search-cities', async (req, res) => {
  const { q, province } = req.query;
  try {
    const result = await searchCities(q, province);
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: 'Failed to search cities' });
  }
});

module.exports = router;
