
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Inject global fetch wrapper with query/localStorage override + diagnostics (mirrors root app)
  (() => {
    const env: any = (import.meta as any).env || {};
    const qp = new URLSearchParams(window.location.search);
    const qpBase = qp.get('api_base');
    const stored = localStorage.getItem('API_BASE_OVERRIDE') || '';
    if (env.VITE_API_BASE_URL && !env.VITE_API_BASE) {
      console.warn('[ADMIN][API] Detected deprecated VITE_API_BASE_URL. Rename it to VITE_API_BASE in Netlify environment.');
    }
    let rawBase: string = (qpBase || stored || env.VITE_API_BASE || '').trim();
    if (!rawBase && window.location.hostname.includes('netlify.app')) {
      rawBase = 'https://himperra2-production.up.railway.app';
      console.warn('[ADMIN][API] Using hardcoded production fallback base (set VITE_API_BASE to remove this warning).');
    }
    if (qpBase && qpBase !== stored) localStorage.setItem('API_BASE_OVERRIDE', qpBase);
    if (rawBase) {
      const BASE = rawBase.replace(/\/$/, '');
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        if (typeof input === 'string' && input.startsWith('/api/')) {
          return originalFetch(`${BASE}${input}`, init);
        }
        return originalFetch(input, init);
      };
      (window as any).__API_BASE__ = BASE;
    console.info('[ADMIN][API] Using backend base:', BASE, 'envVar(VITE_API_BASE):', env.VITE_API_BASE, 'deprecatedPresent:', !!env.VITE_API_BASE_URL, 'overrideSource:', qpBase ? 'query-param' : stored ? 'localStorage' : 'env');
    } else {
      console.warn('[ADMIN][API] No backend base resolved (query api_base, localStorage API_BASE_OVERRIDE, env vars). Using relative /api/*');
    }
  })();

  createRoot(document.getElementById("root")!).render(<App />);
  