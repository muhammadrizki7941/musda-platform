const fs = require('fs');
const path = require('path');

// Convert logo to base64
function logoToBase64() {
  try {
    const logoPath = path.join(__dirname, '../../../frontend/public/images/LOGO-SPH.png');
    
    if (!fs.existsSync(logoPath)) {
      // Try alternative paths
      const altPaths = [
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

module.exports = { logoToBase64 };