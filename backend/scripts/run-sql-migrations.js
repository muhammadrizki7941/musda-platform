#!/usr/bin/env node
/**
 * SQL migration runner for raw .sql files.
 * CLI + Programmatic API (require + runMigrations()).
 * Features:
 *  - Ordered scanning with dedupe (first directory wins per filename)
 *  - Numeric prefix ordering (01_, 02_, ... 99_)
 *  - Skip heuristics for existing tables / added columns (unless --force)
 *  - Connection retry
 *  - Exportable runMigrations({ apply, force, logger })
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Reuse logic from db.js but we need a promise pool here directly
function pick(val){ return (val !== undefined && val !== null && val !== '') ? val : undefined; }
const DB_HOST = pick(process.env.DB_HOST);
const DB_USER = pick(process.env.DB_USER);
const DB_PASS = pick(process.env.DB_PASS);
const DB_PASSWORD = pick(process.env.DB_PASSWORD);
const DB_NAME = pick(process.env.DB_NAME);
const DB_PORT = pick(process.env.DB_PORT);
const MYSQLHOST = pick(process.env.MYSQLHOST);
const MYSQLUSER = pick(process.env.MYSQLUSER);
const MYSQLPASSWORD = pick(process.env.MYSQLPASSWORD);
const MYSQLDATABASE = pick(process.env.MYSQLDATABASE);
const MYSQLPORT = pick(process.env.MYSQLPORT);

let resolvedHost = DB_HOST || MYSQLHOST || 'localhost';
let resolvedUser = DB_USER || MYSQLUSER || 'root';
let resolvedPassword = DB_PASS || DB_PASSWORD || MYSQLPASSWORD || '';
let resolvedDatabase = DB_NAME || MYSQLDATABASE || 'musda1';
let resolvedPort = Number(DB_PORT || MYSQLPORT || 3306);

// Auto-correct: if DB_NAME provided equals default 'musda1' but MYSQLDATABASE exists & differs, prefer MYSQLDATABASE
if (resolvedDatabase === 'musda1' && MYSQLDATABASE && MYSQLDATABASE !== 'musda1') {
  console.log('[MIGRATION][ADJUST] Using MYSQLDATABASE instead of default musda1 ->', MYSQLDATABASE);
  resolvedDatabase = MYSQLDATABASE;
}
// If DB_NAME explicitly set but MIGRATION_AUTO_CORRECT_DB=1 and connection later fails ER_BAD_DB_ERROR, we'll swap.

// Safety: if host resolved to localhost but MYSQLHOST exists separately => likely running inside Railway run context but lost ordering
if (resolvedHost === 'localhost' && MYSQLHOST && MYSQLHOST !== 'localhost') {
  console.log('[MIGRATION][ADJUST] Overriding host localhost ->', MYSQLHOST);
  resolvedHost = MYSQLHOST;
}

function parseFlags(argv){
  return { apply: argv.includes('--apply'), force: argv.includes('--force') };
}
const BASE_FLAGS = parseFlags(process.argv);

// Candidate directories (ordered by priority). Adjust if you consolidate later.
const migrationDirs = [
  'src/models/migrations',       // canonical suggested
  'src/utils/migrations',
  'src/migrations',
  'migrations',
];

function collectSqlFiles() {
  const seen = new Set();
  const files = [];
  const numericOrSeed = /^(\d+)_.*\.sql$/i; // accept numbered migrations including 99_seed
  for (const rel of migrationDirs) {
    const abs = path.join(process.cwd(), rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) continue;
    for (const entry of fs.readdirSync(abs)) {
      if (!entry.endsWith('.sql')) continue;
      // Skip legacy non-numbered files to prevent double-processing
      if (!numericOrSeed.test(entry)) continue;
      if (seen.has(entry)) continue; // dedupe by base filename
      const full = path.join(abs, entry);
      files.push({ name: entry, fullPath: full, dir: rel });
      seen.add(entry);
    }
  }
  // Sort: if filenames start with digits + underscore use that numeric weight first
  files.sort((a, b) => {
    const rx = /^(\d+)_/;
    const weight = (f) => {
      const m = f.name.match(rx);
      if (m) return parseInt(m[1], 10); // numeric prefix wins
      // ensure create_ comes before alter_
      if (f.name.startsWith('create_')) return 100000; // base bucket
      if (f.name.startsWith('alter_')) return 200000;
      return 150000; // others in middle
    };
    const wa = weight(a);
    const wb = weight(b);
    if (wa !== wb) return wa - wb;
    return a.name.localeCompare(b.name);
  });
  return files;
}

async function tableExists(conn, table) {
  const [rows] = await conn.query('SHOW TABLES LIKE ?', [table]);
  return rows.length > 0;
}

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1',
    [table, column]
  );
  return rows.length > 0;
}

function extractCreateTableNames(sql) {
  // naive capture of `CREATE TABLE` statements
  const regex = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+`?(\w+)`?/gi;
  const names = [];
  let m;
  while ((m = regex.exec(sql))) names.push(m[1]);
  // also support without IF NOT EXISTS
  const regex2 = /CREATE\s+TABLE\s+`?(\w+)`?/gi;
  while ((m = regex2.exec(sql))) {
    if (!names.includes(m[1])) names.push(m[1]);
  }
  return [...new Set(names)];
}

async function runMigrations(opts = {}) {
  const APPLY = opts.apply !== undefined ? opts.apply : BASE_FLAGS.apply;
  const FORCE = opts.force !== undefined ? opts.force : BASE_FLAGS.force;
  const logger = opts.logger || console;
  const files = collectSqlFiles();
  if (!files.length) {
    logger.log('Tidak ada file .sql ditemukan di direktori kandidat.');
    return;
  }
  logger.log(`Menemukan ${files.length} file unik.`);
  files.forEach((f, i) => logger.log(`${i + 1}. ${f.name} [${f.dir}]`));

  if (!APPLY) {
    logger.log('\nMode dry-run. Tambahkan --apply untuk eksekusi.');
    return;
  }

  // Diagnostic log of resolved environment (mask password) for troubleshooting
  const maskedPwd = resolvedPassword ? (resolvedPassword.length > 4 ? resolvedPassword.slice(0,2) + '***' + resolvedPassword.slice(-2) : '***') : '(empty)';
  logger.log('\n[ENV RESOLVED]', {
    host: resolvedHost,
    port: resolvedPort,
    user: resolvedUser,
    database: resolvedDatabase,
    password: maskedPwd,
    sources: {
      DB_HOST, MYSQLHOST,
      DB_USER, MYSQLUSER,
      DB_NAME, MYSQLDATABASE,
      DB_PORT, MYSQLPORT
    }
  });

  // Add simple retry for initial connection to handle DB cold start (e.g., Railway plugin spin-up)
  const maxAttempts = parseInt(process.env.MIGRATION_DB_CONNECT_ATTEMPTS || '10', 10);
  const delayMs = parseInt(process.env.MIGRATION_DB_CONNECT_DELAY_MS || '3000', 10);
  let attempt = 0;
  let conn;
  let lastErr;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      logger.log(`\n[MIGRATION] Attempt ${attempt}/${maxAttempts} connect -> ${resolvedUser}@${resolvedHost}:${resolvedPort}/${resolvedDatabase}`);
      conn = await mysql.createConnection({
        host: resolvedHost,
        user: resolvedUser,
        password: resolvedPassword,
        database: resolvedDatabase,
        port: resolvedPort,
        multipleStatements: true,
      });
      logger.log(`[MIGRATION] Connected.`);
      break;
    } catch (err) {
      lastErr = err;
      logger.log(`[MIGRATION] Connection failed: ${err.code || err.message}`);
      // Unknown database handling
      if (err.code === 'ER_BAD_DB_ERROR') {
        if (process.env.MIGRATION_AUTO_CORRECT_DB === '1' && MYSQLDATABASE && MYSQLDATABASE !== resolvedDatabase) {
          logger.log(`[MIGRATION][DB] Auto-correcting database ${resolvedDatabase} -> ${MYSQLDATABASE}`);
          resolvedDatabase = MYSQLDATABASE;
          continue; // retry with corrected database name
        }
        if (process.env.MIGRATION_CREATE_DB === '1') {
          try {
            logger.log(`[MIGRATION][DB] Attempting to create database ${resolvedDatabase} ...`);
            const tempConn = await mysql.createConnection({
              host: resolvedHost,
              user: resolvedUser,
              password: resolvedPassword,
              port: resolvedPort
            });
            await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${resolvedDatabase}\``);
            await tempConn.end();
            logger.log('[MIGRATION][DB] Database ensured, retrying connection...');
            continue; // retry createConnection in same attempt count
          } catch (ce) {
            logger.log('[MIGRATION][DB] Create database failed:', ce.message);
          }
        }
      }
      // Fallback: if ENOTFOUND using internal host and we have MYSQL_URL / MYSQL_PUBLIC_URL, parse and switch once
      if ((err.code === 'ENOTFOUND' || /ENOTFOUND/.test(err.message)) && (process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL) && !process.env.__MIG_FELLBACK) {
        const candidate = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL; // prefer explicit public
        try {
          const u = new URL(candidate);
          if (u.hostname && u.hostname !== resolvedHost) {
            logger.log(`[MIGRATION][FALLBACK] Switching host ${resolvedHost} -> ${u.hostname}`);
            resolvedHost = u.hostname;
            if (u.port) { resolvedPort = Number(u.port); }
            if (u.username) { resolvedUser = u.username; }
            if (u.password) { resolvedPassword = u.password; }
            process.env.__MIG_FELLBACK = '1';
            continue; // retry immediately with new host (same attempt count)
          }
        } catch(_) {/* ignore parse errors */}
      }
      if (attempt >= maxAttempts) {
        throw err;
      }
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  const results = [];
  for (const f of files) {
    const sql = fs.readFileSync(f.fullPath, 'utf8');
    const creates = extractCreateTableNames(sql);
    // Detect ALTER TABLE ... ADD COLUMN patterns to allow skip if all columns already exist
    const alterAddMatches = [];
    const alterRegex = /ALTER\s+TABLE\s+`?(\w+)`?([\s\S]*?);/gi;
    let am;
    while ((am = alterRegex.exec(sql))) {
      const table = am[1];
      const segment = am[2];
      const colRegex = /ADD\s+COLUMN\s+`?(\w+)`?/gi;
      let cm;
      const cols = [];
      while ((cm = colRegex.exec(segment))) cols.push(cm[1]);
      if (cols.length) alterAddMatches.push({ table, cols });
    }
    if (!FORCE && creates.length) {
      let allExist = true;
      for (const t of creates) {
        // Skip if generic name that may appear in multiple sets? We'll just check.
        /* eslint-disable no-await-in-loop */
        const exists = await tableExists(conn, t);
        if (!exists) { allExist = false; break; }
      }
      if (allExist) {
        logger.log(`Lewati ${f.name} (semua tabel sudah ada)`);
        results.push({ file: f.name, status: 'skipped-existing' });
        continue;
      }
    }
    if (!FORCE && alterAddMatches.length && !creates.length) {
      let allAlterColsExist = true;
      for (const match of alterAddMatches) {
        const tableExistsFlag = await tableExists(conn, match.table);
        if (!tableExistsFlag) { allAlterColsExist = false; break; }
        for (const col of match.cols) {
          const exists = await columnExists(conn, match.table, col);
            if (!exists) { allAlterColsExist = false; break; }
        }
        if (!allAlterColsExist) break;
      }
      if (allAlterColsExist) {
        logger.log(`Lewati ${f.name} (kolom alter sudah ada)`);
        results.push({ file: f.name, status: 'skipped-alter-existing' });
        continue;
      }
    }
    logger.log(`Menjalankan ${f.name} ...`);
    try {
      await conn.beginTransaction();
      await conn.query(sql);
      await conn.commit();
      logger.log('OK');
      results.push({ file: f.name, status: 'applied' });
    } catch (e) {
      await conn.rollback();
      logger.error(`GAGAL: ${e.message}`);
      results.push({ file: f.name, status: 'error', error: e.message });
      // lanjut ke file berikut (tidak hard fail). Bisa ubah jika mau strict.
    }
  }

  logger.log('\nRingkasan:');
  const stats = results.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  if (logger.table) logger.table(results); else logger.log(JSON.stringify(results,null,2));
  logger.log('Statistik:', stats);
  await conn.end();
  return { results, stats };
}

if (require.main === module) {
  runMigrations().catch(err => {
    console.error('Fatal error:', err);
    console.error('Pastikan service database sudah aktif dan variabel lingkungan DB_HOST/USER/PASS/NAME atau MYSQL* benar.');
    process.exit(1);
  });
} else {
  module.exports = { runMigrations };
}
