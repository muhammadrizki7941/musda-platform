const path = require('path');
const os = require('os');

// Root uploads dir. On Vercel (serverless, read-only FS), write to /tmp instead of repo.
// For local/Railway, use repo-level ../../uploads.
const isServerless = !!process.env.VERCEL || process.env.SERVERLESS_TMP === '1';
const DEFAULT_UPLOADS = path.join(__dirname, '../../uploads');
const UPLOADS_ABS_ROOT = isServerless ? path.join(os.tmpdir(), 'uploads') : DEFAULT_UPLOADS;

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
