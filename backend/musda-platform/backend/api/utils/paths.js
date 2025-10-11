const path = require('path');

// Root uploads dir served by Express in index.js using ../../uploads from backend/src
// This resolves to <repo_root>/uploads
const UPLOADS_ABS_ROOT = path.join(__dirname, '../../uploads');

function getUploadsAbsPath(...segments) {
  return path.join(UPLOADS_ABS_ROOT, ...segments);
}

function getUploadsPublicPath(...segments) {
  // Public path used by Express static: '/uploads/...'
  return ['uploads', ...segments].join('/');
}

module.exports = {
  UPLOADS_ABS_ROOT,
  getUploadsAbsPath,
  getUploadsPublicPath,
};
