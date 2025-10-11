
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";
  import "./styles/admin-theme.css";

  // --- Global API base injection & fetch wrapper ---------------------------------
  // Many components call fetch('/api/...') which works locally but on Netlify hits Netlify itself.
  // We dynamically prepend the backend origin from env (VITE_API_BASE or VITE_API_BASE_URL).
  (() => {
    // Access Vite injected env; fallback defensive cast
    const env: any = (import.meta as any).env || {};
      const qp = new URLSearchParams(window.location.search);
      const qpBase = qp.get('api_base');
      const stored = localStorage.getItem('API_BASE_OVERRIDE') || '';
      if (env.VITE_API_BASE_URL && !env.VITE_API_BASE) {
        console.warn('[API] Detected deprecated VITE_API_BASE_URL. Rename it to VITE_API_BASE in Netlify environment.');
      }
      let rawBase: string = (qpBase || stored || env.VITE_API_BASE || '').trim();
      // Hard fallback: if in production (Netlify) and no env resolved, use known Railway domain
      if (!rawBase && window.location.hostname.includes('netlify.app')) {
        rawBase = 'https://himperra2-production.up.railway.app';
        console.warn('[API] Using hardcoded production fallback base (set VITE_API_BASE to remove this warning).');
      }
      if (qpBase && qpBase !== stored) {
        // Persist override for subsequent navigations
        localStorage.setItem('API_BASE_OVERRIDE', qpBase);
      }
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
    console.info('[API] Using backend base:', BASE, 'envVar(VITE_API_BASE):', env.VITE_API_BASE, 'deprecatedPresent:', !!env.VITE_API_BASE_URL, 'overrideSource:', qpBase ? 'query-param' : stored ? 'localStorage' : 'env');
      } else {
    console.warn('[API] No backend base resolved. Checked (query api_base, localStorage API_BASE_OVERRIDE, VITE_API_BASE). Using relative /api/*');
      }
  })();

  // Ensure dark theme class present before React mounts (defensive)
  const rootEl = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      rootEl.classList.remove('dark');
    } else {
      rootEl.classList.add('dark');
    }
  } catch {/* ignore */}

  createRoot(document.getElementById("root")!).render(<App />);
  