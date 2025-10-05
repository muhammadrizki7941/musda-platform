const fs = require('fs');
const path = require('path');

// Try to load full dataset if provided by user at backend/src/data/indonesia_cities.json
// Expected shape: [{ province: 'Lampung', cities: ['Bandar Lampung', 'Metro', ...] }, ...]
function loadDataset() {
  const customPath = path.join(__dirname, 'indonesia_cities.json');
  if (fs.existsSync(customPath)) {
    try {
      const raw = fs.readFileSync(customPath, 'utf-8');
      const json = JSON.parse(raw);
      if (Array.isArray(json)) return json;
    } catch {}
  }
  // Minimal fallback seed (extend by placing a full JSON file above)
  return [
    { province: 'Lampung', cities: ['Bandar Lampung', 'Metro', 'Pringsewu', 'Lampung Selatan', 'Lampung Tengah'] },
    { province: 'DKI Jakarta', cities: ['Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara', 'Jakarta Selatan'] },
    { province: 'Jawa Barat', cities: ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cimahi'] },
    { province: 'Jawa Tengah', cities: ['Semarang', 'Surakarta', 'Magelang', 'Salatiga', 'Tegal'] },
    { province: 'Jawa Timur', cities: ['Surabaya', 'Malang', 'Kediri', 'Madiun', 'Probolinggo'] },
    { province: 'Banten', cities: ['Serang', 'Tangerang', 'Tangerang Selatan', 'Cilegon'] },
    { province: 'Bali', cities: ['Denpasar', 'Badung', 'Tabanan', 'Gianyar'] },
    { province: 'Sumatera Utara', cities: ['Medan', 'Binjai', 'Tebing Tinggi', 'Pematangsiantar'] }
  ];
}

const DATA = loadDataset();

function getProvinces() {
  return DATA.map(d => d.province).sort((a, b) => a.localeCompare(b));
}

function getCities(province) {
  const item = DATA.find(d => d.province.toLowerCase() === String(province || '').toLowerCase());
  return item ? [...item.cities] : [];
}

function searchCities(q, province) {
  const query = String(q || '').trim().toLowerCase();
  let list = [];
  if (province) {
    list = getCities(province);
  } else {
    list = DATA.flatMap(d => d.cities.map(c => ({ city: c, province: d.province })));
    // Normalize shape: return names only when no province filter
    return list.filter(item => item.city.toLowerCase().includes(query));
  }
  return list.filter(c => c.toLowerCase().includes(query));
}

module.exports = { getProvinces, getCities, searchCities };
