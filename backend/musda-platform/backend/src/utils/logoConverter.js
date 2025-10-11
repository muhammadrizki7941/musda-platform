const fs = require('fs');
const path = require('path');

// Convert MUSDA (default) or generic logo to base64
function logoToBase64() {
  try {
    // Prefer MUSDA logo when available
    const musdaLogo = path.join(__dirname, '../../../frontend/public/images/logo-musda.png');
    const logoPath = fs.existsSync(musdaLogo)
      ? musdaLogo
      : path.join(__dirname, '../../../frontend/public/images/LOGO-SPH.png');
    
    if (!fs.existsSync(logoPath)) {
      // Try alternative paths
      const altPaths = [
        path.join(__dirname, '../../../frontend/public/images/logo-musda.png'),
        path.join(__dirname, '../../../frontend/public/images/logo-sph.png'),
        path.join(__dirname, '../../../uploads/LOGO-SPH.png'),
        path.join(__dirname, '../../uploads/LOGO-SPH.png')
      ];
      
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          const logoBuffer = fs.readFileSync(altPath);
          const base64Logo = logoBuffer.toString('base64');
          return `data:image/png;base64,${base64Logo}`;
        }
      }
      
      return null;
    }
    
    const logoBuffer = fs.readFileSync(logoPath);
    const base64Logo = logoBuffer.toString('base64');
    return `data:image/png;base64,${base64Logo}`;
    
  } catch (error) {
    console.error('❌ Error converting logo:', error.message);
    return null;
  }
}

// Convert SPH logo to base64 (prefer SPH assets first; fall back to MUSDA if missing)
function sphLogoToBase64() {
  try {
    const candidates = [
      // SPH-first candidates
      path.join(__dirname, '../../../frontend/public/images/LOGO-SPH.png'),
      path.join(__dirname, '../../../frontend/public/images/logo-sph.png'),
      path.join(__dirname, '../../../uploads/LOGO-SPH.png'),
      path.join(__dirname, '../../uploads/LOGO-SPH.png'),
      // As a last resort, use MUSDA logo so email still renders nicely
      path.join(__dirname, '../../../frontend/public/images/logo-musda.png')
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        return `data:image/png;base64,${buf.toString('base64')}`;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error converting SPH logo:', error.message);
    return null;
  }
}

module.exports = { logoToBase64, sphLogoToBase64 };