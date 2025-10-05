// API Configuration for Development
const API_CONFIG = {
  // Local development (XAMPP/Laragon)
  LOCAL_NODE: 'http://localhost:3001/api',
  LOCAL_PHP: 'http://localhost/MUSDA/backend/src/api.php',
  
  // Production (will be set later)
  PRODUCTION: '/api'
};

// Determine current environment and backend type
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// For now, select backend for localhost development
export const API_BASE_URL = isDevelopment
  ? (true ? API_CONFIG.LOCAL_NODE : API_CONFIG.LOCAL_PHP)
  : API_CONFIG.PRODUCTION;

// Backend type selector for development
const USE_NODE_BACKEND = true; // Set to true to use Node.js (port 3001), false to use PHP

// Export file base URL (where /uploads is served)
export const FILE_BASE_URL = isDevelopment
  ? (USE_NODE_BACKEND ? 'http://localhost:3001' : 'http://localhost/MUSDA')
  : '';

// NOTE: keep in sync with FILE_BASE_URL above

// Helper function to get the correct API URL
export function getApiUrl(endpoint: string): string {
  if (isDevelopment) {
    return USE_NODE_BACKEND 
      ? `${API_CONFIG.LOCAL_NODE}${endpoint}`
      : `${API_CONFIG.LOCAL_PHP}${endpoint}`;
  }
  return `${API_CONFIG.PRODUCTION}${endpoint}`;
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