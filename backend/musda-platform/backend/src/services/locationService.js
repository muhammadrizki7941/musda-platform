const axios = require('axios');
const { getProvinces: getLocalProvinces, getCities: getLocalCities } = require('../data/locations');

// External API base (default to emsifa which is public and free). Allow override via env.
const BASE = process.env.WILAYAH_API_BASE || 'https://www.emsifa.com/api-wilayah-indonesia/api';

// Simple in-memory cache
const cache = {
  provinces: null,
  provincesMap: null, // nameLower -> { id, name }
  provincesAt: 0,
  citiesByProvId: new Map(), // provId -> { list, at }
};

const TTL = 1000 * 60 * 60 * 24; // 24h

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function stripKabKota(name) {
  return String(name || '').replace(/^kabupaten\s+/i, '').replace(/^kota\s+/i, '').trim();
}

async function fetchProvinces() {
  const now = Date.now();
  if (cache.provinces && now - cache.provincesAt < TTL) return cache.provinces;
  try {
    const url = `${BASE}/provinces.json`;
    const { data } = await axios.get(url, { timeout: 10000 });
    if (Array.isArray(data)) {
      cache.provinces = data; // [{id, name}]
      cache.provincesAt = now;
      cache.provincesMap = new Map(
        data.map(p => [normalizeName(p.name), { id: p.id, name: p.name }])
      );
      return data;
    }
  } catch (e) {
    // Fallback to local minimal dataset
    const local = getLocalProvinces().map((name, idx) => ({ id: `${idx+1}`, name }));
    cache.provinces = local;
    cache.provincesAt = now;
    cache.provincesMap = new Map(local.map(p => [normalizeName(p.name), { id: p.id, name: p.name }]));
    return local;
  }
}

async function fetchCitiesByProvinceName(provinceName) {
  const provs = await fetchProvinces();
  const key = normalizeName(provinceName);
  const found = cache.provincesMap.get(key) || provs.find(p => normalizeName(p.name) === key);
  if (!found) return [];
  const provId = found.id;
  const now = Date.now();
  const cached = cache.citiesByProvId.get(provId);
  if (cached && now - cached.at < TTL) return cached.list;
  try {
    const url = `${BASE}/regencies/${provId}.json`;
    const { data } = await axios.get(url, { timeout: 10000 });
    const list = Array.isArray(data) ? data.map(r => stripKabKota(r.name)) : [];
    cache.citiesByProvId.set(provId, { list, at: now });
    return list;
  } catch (e) {
    // Fallback to local minimal dataset
    const list = getLocalCities(provinceName).map(stripKabKota);
    cache.citiesByProvId.set(provId, { list, at: now });
    return list;
  }
}

async function searchCities(q, provinceName) {
  const query = normalizeName(q);
  if (!query) return [];
  if (provinceName) {
    const cities = await fetchCitiesByProvinceName(provinceName);
    return cities.filter(c => normalizeName(c).includes(query));
  }
  // If no province, search across all provinces using local fallback (for performance); could be extended to fetch all regencies.
  const provinces = await fetchProvinces();
  const results = [];
  for (const p of provinces) {
    const cities = await fetchCitiesByProvinceName(p.name);
    for (const c of cities) {
      if (normalizeName(c).includes(query)) results.push({ city: c, province: p.name });
    }
  }
  return results;
}

module.exports = { fetchProvinces, fetchCitiesByProvinceName, searchCities };
