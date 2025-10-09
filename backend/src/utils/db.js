const mysql = require('mysql2');

function pick(val){ return (val !== undefined && val !== null && val !== '') ? val : undefined; }
// Prefer explicit IPv4 mapping if internal host resolves to IPv6 and causes ECONNREFUSED
let rawHost = pick(process.env.DB_HOST) || pick(process.env.MYSQLHOST) || 'localhost';
if (rawHost === 'localhost' && pick(process.env.MYSQLHOST) && pick(process.env.MYSQLHOST) !== 'localhost') {
  console.log('[DB][ADJUST] Overriding host localhost ->', process.env.MYSQLHOST);
  rawHost = process.env.MYSQLHOST;
}
if (rawHost === 'mysql.railway.internal' && process.env.FORCE_IPV4_DB === '1') {
  // Force IPv4 loopback mapping (works only inside container if MySQL bound all interfaces)
  rawHost = '127.0.0.1';
}

const resolvedHost = rawHost;
const resolvedUser = pick(process.env.DB_USER) || pick(process.env.MYSQLUSER) || 'root';
const resolvedPassword = pick(process.env.DB_PASS) || pick(process.env.DB_PASSWORD) || pick(process.env.MYSQLPASSWORD) || '';
const resolvedDatabase = pick(process.env.DB_NAME) || pick(process.env.MYSQLDATABASE) || 'musda1';
const resolvedPort = Number(pick(process.env.DB_PORT) || pick(process.env.MYSQLPORT) || 3306);

const connConfigLog = { host: resolvedHost, user: resolvedUser, database: resolvedDatabase, port: resolvedPort };
console.log('[DB] Using connection config:', connConfigLog);

if (/(\.railway\.internal)$/.test(resolvedHost) && !process.env.RAILWAY_STATIC_URL && !process.env.RAILWAY_ENVIRONMENT) {
  console.warn('[DB][WARN] Internal Railway host used outside Railway environment. This will fail locally.');
}

let effectiveHost = resolvedHost;
let effectiveUser = resolvedUser;
let effectivePassword = resolvedPassword;
let effectivePort = resolvedPort;

// Optional immediate fallback if internal host and PREFER_PUBLIC_DB set
if (process.env.PREFER_PUBLIC_DB === '1' && (process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL)) {
  try {
    const candidate = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    const u = new URL(candidate);
    if (u.hostname) {
      console.log('[DB][FALLBACK] Using public host due to PREFER_PUBLIC_DB=1 ->', u.hostname);
      effectiveHost = u.hostname;
      if (u.port) effectivePort = Number(u.port);
      if (u.username) effectiveUser = u.username;
      if (u.password) effectivePassword = u.password;
      if (u.pathname && u.pathname !== '/') effectivePort = effectivePort; // no-op; keep pattern for clarity
    }
  } catch(e){ console.log('[DB][FALLBACK] Parse public URL failed:', e.message); }
}

const pool = mysql.createPool({
  host: effectiveHost,
  user: effectiveUser,
  password: effectivePassword,
  database: resolvedDatabase,
  port: effectivePort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const db = pool;
const dbPromise = pool.promise();

async function initialProbe(retries = 8, delayMs = 1500) {
  for (let i = 1; i <= retries; i++) {
    try {
      await dbPromise.query('SELECT 1');
      console.log('✅ Database connection successful');
      return true;
    } catch (e) {
      console.warn(`⚠️  DB probe ${i}/${retries} failed: ${e.code || e.message}`);
      if (i === retries) {
        console.error('❌ Database connection failed after retries:', e.message);
        return false;
      }
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

initialProbe();

module.exports = { db, dbPromise };
