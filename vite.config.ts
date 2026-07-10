
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const releaseManifest = JSON.parse(
  readFileSync(resolve(__dirname, 'release/version.json'), 'utf8'),
) as {
  semver: string;
  release: string;
  cacheKey: string;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || 'https://luna29.vercel.app').replace(/\/+$/, '');
  const devBootstrapPassword =
    mode === 'development' ? String(env.SUPER_ADMIN_BOOTSTRAP_PASSWORD || env.VITE_SUPER_ADMIN_BOOTSTRAP_PASSWORD || '').trim() : '';
  const appRelease =
    process.env.VITE_APP_RELEASE ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ||
    releaseManifest.release ||
    releaseManifest.cacheKey ||
    releaseManifest.semver;
  const shellCacheKey = releaseManifest.cacheKey || appRelease.slice(0, 12);

  return {
  define: {
    __LUNA_SENTRY_DSN__: JSON.stringify(process.env.VITE_SENTRY_DSN || ''),
    __LUNA_SENTRY_ENV__: JSON.stringify(process.env.VITE_SENTRY_ENV || ''),
    __LUNA_APP_RELEASE__: JSON.stringify(appRelease),
    __LUNA_SHELL_CACHE_KEY__: JSON.stringify(shellCacheKey),
    __LUNA_GA4_ID__: JSON.stringify(process.env.VITE_GA4_MEASUREMENT_ID || ''),
    __LUNA_VITE_DEV__: JSON.stringify(mode === 'development'),
    ...(devBootstrapPassword
      ? { 'import.meta.env.VITE_SUPER_ADMIN_BOOTSTRAP_PASSWORD': JSON.stringify(devBootstrapPassword) }
      : {}),
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
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
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
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.AUTH_API_PORT || 8787}`,
        changeOrigin: true,
      },
    },
  },
  };
});
