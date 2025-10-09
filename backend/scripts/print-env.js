#!/usr/bin/env node
/*
 * Enhanced environment snapshot utility.
 * Features:
 *  - Loads local .env when not running inside Railway (if present)
 *  - Marks origin of each variable: process|dotenv|absent
 *  - Masks sensitive values (passwords, secrets)
 *  - Adds derived DB resolution summary & warnings (e.g., PORT=3306)
 *  - Outputs structured JSON for easier machine parsing.
 */
const fs = require('fs');
const path = require('path');

const isRailway = !!(process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT);
let dotenvLoaded = false;
let dotenvParsed = {};

if (!isRailway) {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
      const dotenv = require('dotenv');
      const result = dotenv.config({ path: envPath });
      if (result.parsed) {
        dotenvLoaded = true;
        dotenvParsed = result.parsed;
      }
    } catch (e) {
      console.error('[env:print] Failed to load .env:', e.message);
    }
  }
}

const keys = [
  'DB_HOST','DB_USER','DB_PASS','DB_PASSWORD','DB_NAME','DB_PORT',
  'MYSQLHOST','MYSQLUSER','MYSQLPASSWORD','MYSQLDATABASE','MYSQLPORT',
  'PORT','APP_PORT','NODE_ENV','FRONTEND_URL','BACKEND_URL','JWT_SECRET','SMTP_HOST','SMTP_PORT','SMTP_USER'
];

function mask(val) {
  if (!val) return null;
  if (val.length <= 4) return '***';
  return val.slice(0,2) + '***' + val.slice(-2);
}

const sensitiveRegex = /(PASS|PASSWORD|SECRET|TOKEN|KEY)/i;
const envReport = {};

keys.forEach(k => {
  let origin = 'absent';
  let value = undefined;
  if (Object.prototype.hasOwnProperty.call(process.env, k) && process.env[k] !== '') {
    origin = 'process';
    value = process.env[k];
  } else if (Object.prototype.hasOwnProperty.call(dotenvParsed, k)) {
    origin = 'dotenv';
    value = dotenvParsed[k];
  } else {
    value = null;
  }
  const masked = sensitiveRegex.test(k) ? mask(value) : value;
  envReport[k] = { value: masked, origin };
});

// Derive effective DB connection values similar to db.js fallback logic.
function pick(...candidates) {
  for (const c of candidates) {
    if (c && c !== '') return c;
  }
  return null;
}
const effective = {
  host: pick(process.env.DB_HOST, process.env.MYSQLHOST),
  user: pick(process.env.DB_USER, process.env.MYSQLUSER),
  password: pick(process.env.DB_PASS, process.env.DB_PASSWORD, process.env.MYSQLPASSWORD),
  database: pick(process.env.DB_NAME, process.env.MYSQLDATABASE),
  port: pick(process.env.DB_PORT, process.env.MYSQLPORT, '3306')
};

const warnings = [];
if (effective.host && effective.host.endsWith('.railway.internal') && !isRailway) {
  warnings.push('Using an internal Railway host outside Railway environment will fail (network unreachable).');
}
const httpPortRaw = process.env.PORT || process.env.APP_PORT;
if (httpPortRaw === '3306') {
  warnings.push('PORT is 3306 (MySQL port). Your HTTP server should not bind to the DB port; override with APP_PORT=8080 or similar.');
}
['host','user','password','database'].forEach(f => {
  if (!effective[f]) warnings.push(`Missing DB field: ${f}`);
});

const summary = {
  isRailway,
  dotenvLoaded,
  cwd: process.cwd(),
  effectiveDb: {
    host: effective.host,
    user: effective.user,
    password: effective.password ? mask(effective.password) : null,
    database: effective.database,
    port: effective.port
  },
  httpPortRaw: httpPortRaw || null,
  dbHostSource: envReport.DB_HOST?.origin === 'absent' && envReport.MYSQLHOST?.origin !== 'absent' ? 'MYSQLHOST' : (envReport.DB_HOST?.origin !== 'absent' ? 'DB_HOST' : 'none')
};

const output = { meta: summary, env: envReport, warnings };

console.log(JSON.stringify(output, null, 2));
