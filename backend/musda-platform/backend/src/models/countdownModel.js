// countdownModel.js
const { dbPromise: db } = require('../utils/db');

const getCountdown = async () => {
  const [rows] = await db.query('SELECT * FROM countdown LIMIT 1');
  return rows[0];
};

const setCountdown = async (targetDate) => {
  await db.query('DELETE FROM countdown');
  await db.query('INSERT INTO countdown (target_date) VALUES (?)', [targetDate]);
};

module.exports = { getCountdown, setCountdown };
