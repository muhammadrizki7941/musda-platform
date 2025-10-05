
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";
  import "./styles/admin-theme.css";

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
  