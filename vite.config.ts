
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || 'https://luna29.vercel.app').replace(/\/+$/, '');

  return {
  define: {
    __LUNA_SENTRY_DSN__: JSON.stringify(process.env.VITE_SENTRY_DSN || ''),
    __LUNA_SENTRY_ENV__: JSON.stringify(process.env.VITE_SENTRY_ENV || ''),
    __LUNA_APP_RELEASE__: JSON.stringify(process.env.VITE_APP_RELEASE || ''),
    __LUNA_GA4_ID__: JSON.stringify(process.env.VITE_GA4_MEASUREMENT_ID || ''),
  },
  plugins: [
    react(),
    {
      name: 'luna-site-url-html',
      transformIndexHtml(html) {
        return html.replaceAll('__SITE_URL__', siteUrl);
      },
    },
    {
      name: 'luna-dev-no-store',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cache-Control', 'no-store');
          next();
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/motion')) return 'vendor-ui';
          if (id.includes('/components/AdminPanelView') || id.includes('/services/adminService')) return 'feature-admin';
          if (id.includes('/components/AudioReflection') || id.includes('/components/MyVoiceFilesView')) return 'feature-voice';
          if (id.includes('/components/PublicLandingView')) return 'feature-public-landing';
          if (id.includes('/components/AboutLunaView')) return 'feature-public-about';
          if (id.includes('/components/HowItWorksView')) return 'feature-public-how';
          if (id.includes('/components/LegalDocumentView')) return 'feature-public-legal';
          if (id.includes('/components/AuthView')) return 'feature-auth';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: 'localhost',
    headers: {
      'Cache-Control': 'no-store',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  };
});
