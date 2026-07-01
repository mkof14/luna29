
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Inter, sans-serif', background: '#f8fafc', color: '#334155' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed' }}>Luna29</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: '12px 0' }}>Something went wrong</h1>
            <p style={{ marginBottom: 20, lineHeight: 1.5 }}>{this.state.error.message || 'The app failed to start.'}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{ padding: '12px 20px', borderRadius: 999, border: 'none', background: '#6d28d9', color: '#fff', fontWeight: 800, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const applyInitialTheme = () => {
  const saved = localStorage.getItem('luna_theme');
  document.documentElement.classList.toggle('dark', saved === 'dark');
};

applyInitialTheme();

const setMobileAppViewport = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  document.documentElement.classList.toggle('luna-mobile-app', isMobile);
};

const applyStandaloneClass = () => {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
  document.documentElement.classList.toggle('luna-standalone', standalone);
};

setMobileAppViewport();
applyStandaloneClass();
window.addEventListener('resize', setMobileAppViewport, { passive: true });
window.addEventListener('orientationchange', setMobileAppViewport, { passive: true });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  const purgeLegacyCaches = async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch {
      // ignore
    }
  };

  if (import.meta.env.DEV) {
    purgeLegacyCaches();
  } else {
    const resetKey = 'luna_cache_reset_v3';
    const needsReset = (() => {
      try {
        return localStorage.getItem(resetKey) !== '1';
      } catch {
        return true;
      }
    })();

    if (needsReset) {
      purgeLegacyCaches().finally(() => {
        try {
          localStorage.setItem(resetKey, '1');
        } catch {
          // ignore
        }
        window.location.reload();
      });
    }
  }
}
