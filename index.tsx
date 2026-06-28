
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

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
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
