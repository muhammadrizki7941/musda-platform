#!/usr/bin/env node
/**
 * build-schema.js
 * Concatenate ordered SQL migration files (01.., 99..) into a single schema-full.sql snapshot.
 * This is useful for quick provisioning, backup visibility, or manual DB import.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const migrationsDir = path.join(root, 'src', 'models', 'migrations');
const outDir = path.join(root, 'dist');
const outFile = path.join(outDir, 'schema-full.sql');

function isSql(name){ return name.toLowerCase().endsWith('.sql'); }

if (!fs.existsSync(migrationsDir)) {
  console.error('[schema:bundle] Migrations directory not found:', migrationsDir);
  process.exit(1);
}

const files = fs.readdirSync(migrationsDir)
  .filter(isSql)
  .sort((a,b)=> a.localeCompare(b, undefined, { numeric:true, sensitivity:'base' }));

if (!files.length) {
  console.error('[schema:bundle] No .sql migration files found.');
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const timestamp = new Date().toISOString();
let combined = `-- SCHEMA SNAPSHOT GENERATED ${timestamp}\n-- Source directory: ${path.relative(root, migrationsDir)}\n`;

files.forEach(f => {
  const p = path.join(migrationsDir, f);
  let content = fs.readFileSync(p, 'utf8');
  // Normalize line endings
  content = content.replace(/\r\n/g, '\n');
  combined += `\n\n-- >>> BEGIN FILE: ${f} >>> ------------------------------\n`;
  combined += content.trimEnd();
  combined += `\n-- <<< END FILE: ${f} <<< --------------------------------\n`;
});

// Ensure trailing newline
combined += '\n';

fs.writeFileSync(outFile, combined, 'utf8');
console.log(`[schema:bundle] Wrote ${files.length} files into ${path.relative(root, outFile)}`);
console.log('[schema:bundle] Done.');
