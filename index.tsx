
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { prepareLocalDevRuntime, purgeServiceWorkerCaches, shouldBypassServiceWorker } from './utils/devRuntime';
import { ensureFreshAppShell } from './utils/appShellVersion';

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

const mountApp = () => {
  applyInitialTheme();
  setMobileAppViewport();
  applyStandaloneClass();
  window.addEventListener('resize', setMobileAppViewport, { passive: true });
  window.addEventListener('orientationchange', setMobileAppViewport, { passive: true });

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Could not find root element to mount to');
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </React.StrictMode>
  );
};

const bootstrap = async () => {
  const bootState = await prepareLocalDevRuntime();
  if (bootState === 'reloading') return;

  const shellState = await ensureFreshAppShell();
  if (shellState === 'reloading') return;

  mountApp();

  if ('serviceWorker' in navigator && shouldBypassServiceWorker()) {
    window.addEventListener('load', () => {
      purgeServiceWorkerCaches().catch(() => undefined);
    });
  }
};

void bootstrap();
