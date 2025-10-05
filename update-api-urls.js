#!/usr/bin/env node

/**
 * Script untuk mengupdate semua API calls dari localhost ke production-ready URLs
 * Jalankan dengan: node update-api-urls.js
 */

const fs = require('fs');
const path = require('path');

// Pola yang akan dicari dan diganti
const patterns = [
  {
    search: /http:\/\/localhost:5001\/api\//g,
    replace: 'getApiUrl(\''
  },
  {
    search: /http:\/\/localhost:5001(?!\/api)/g,
    replace: 'getFileUrl(\''
  },
  {
    search: /fetch\('\/api\//g,
    replace: 'fetch(getApiUrl(\''
  }
];

// Fungsi untuk mengupdate file
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Cek apakah sudah ada import
    const hasApiImport = content.includes('getApiUrl') || content.includes('getFileUrl');
    
    patterns.forEach(pattern => {
      if (pattern.search.test(content)) {
        content = content.replace(pattern.search, pattern.replace);
        hasChanges = true;
      }
    });

    // Tambahkan import jika belum ada dan ada perubahan
    if (hasChanges && !hasApiImport) {
      // Cari baris import terakhir
      const importLines = content.split('\n');
      let insertIndex = 0;
      
      for (let i = 0; i < importLines.length; i++) {
        if (importLines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        }
      }

      // Tentukan path relatif ke config/api
      const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'frontend/src/config')).replace(/\\/g, '/');
      const importStatement = `import { getApiUrl, getFileUrl } from '${relativePath}/api';`;
      
      importLines.splice(insertIndex, 0, importStatement);
      content = importLines.join('\n');
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Fungsi untuk scan directory
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      updateFile(fullPath);
    }
  });
}

// Jalankan update
console.log('🔄 Updating API URLs for production...');
scanDirectory(path.join(__dirname, 'frontend/src'));
console.log('✅ API URL update completed!');

console.log('\n📝 Manual steps required:');
console.log('1. Review all fetch() calls yang menggunakan template literals');
console.log('2. Pastikan error handling sudah sesuai');
console.log('3. Test di development mode dulu sebelum deploy');
