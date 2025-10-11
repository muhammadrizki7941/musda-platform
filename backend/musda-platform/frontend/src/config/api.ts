// Central API configuration (development + production)
const API_CONFIG = {
  LOCAL_NODE: 'http://localhost:3001/api',
  LOCAL_PHP: 'http://localhost/MUSDA/backend/src/api.php'
};

// Environment flags
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const USE_NODE_BACKEND = true; // If false it will use LOCAL_PHP path

// Read Vite-provided environment variables (during build they are statically injected)
const viteEnv: any = (import.meta as any).env || {};
if (viteEnv.VITE_API_BASE_URL && !viteEnv.VITE_API_BASE) {
  // Soft warning at build/runtime (may appear multiple times in dev)
  console.warn('[api.ts] Deprecated VITE_API_BASE_URL detected. Please rename to VITE_API_BASE.');
}
const ENV_API_BASE = (viteEnv.VITE_API_BASE || '').trim();

// Dynamic production base resolver (evaluated at call time)
function resolveProdBase() {
  let rb = '';
  try { rb = (window as any).__API_BASE__ || ''; } catch(_) {}
  if (!rb && ENV_API_BASE) rb = ENV_API_BASE;
  if (!rb && typeof location !== 'undefined' && location.hostname.includes('netlify.app')) {
    // final guard fallback
    rb = 'https://himperra2-production.up.railway.app';
  }
  return rb ? rb.replace(/\/$/, '') + '/api' : '/api';
}

export function currentApiBase() {
  if (isDevelopment) {
    return USE_NODE_BACKEND ? API_CONFIG.LOCAL_NODE : API_CONFIG.LOCAL_PHP;
  }
  return resolveProdBase();
}

// Backward compatibility constant (may become stale, prefer currentApiBase())
export const API_BASE_URL = currentApiBase();

// File base (for uploaded files). If ENV_API_BASE provided, strip /api if appended automatically above.
export const FILE_BASE_URL = isDevelopment
  ? (USE_NODE_BACKEND ? 'http://localhost:3001' : 'http://localhost/MUSDA')
  : (ENV_API_BASE ? ENV_API_BASE.replace(/\/$/, '') : '');

// NOTE: keep in sync with FILE_BASE_URL above

// Helper function to get the correct API URL
export function getApiUrl(endpoint: string): string {
  return `${currentApiBase()}${endpoint}`;
}

// Helper function to make API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = getApiUrl(endpoint);
  
  // Merge options so that default headers are preserved unless explicitly overridden
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  try {
  console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, defaultOptions);
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    
    console.log(`✅ API Response:`, data);
    
    if (!response.ok) {
      const msg = data?.message || data?.error || 'Request failed';
      const err = new Error(`HTTP ${response.status}: ${msg}`) as any;
      if (data) (err as any).details = data;
      throw err;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    throw error;
  }
}

// Helper function for file URLs
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  return `${FILE_BASE_URL}${filePath}`;
};

// Export for backward compatibility
export default API_BASE_URL;