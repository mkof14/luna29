/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luna: {
          coral: '#ff5a40',
          purple: '#6d28d9',
          teal: '#0e7490',
          soft: '#f1f5f9',
          surface: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        brand: ['Great Vibes', 'cursive'],
      },
      boxShadow: {
        luna: '0 15px 45px -12px rgba(0, 0, 0, 0.1), 0 8px 20px -6px rgba(0, 0, 0, 0.05)',
        'luna-rich': '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 5px 15px -5px rgba(0, 0, 0, 0.04)',
        'luna-deep': '0 20px 60px -12px rgba(0, 0, 0, 0.12), 0 10px 25px -10px rgba(0, 0, 0, 0.08)',
        'luna-inset': 'inset 0 2px 10px rgba(15, 23, 42, 0.08), 0 8px 20px rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'status-pulse': 'status-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'breath-deep': 'breath-deep 8s ease-in-out infinite',
        'soft-spin': 'soft-spin 20s linear infinite',
        'oscilloscope-drift': 'oscilloscope-drift 8s linear infinite',
        'oscilloscope-glow': 'oscilloscope-glow 2.2s ease-in-out infinite',
        'color-shift-luna': 'color-shift-luna 12s ease-in-out infinite',
        'color-shift-luna-suffix': 'color-shift-luna-suffix 20s ease-in-out infinite',
        'bg-flow': 'bg-flow 60s ease infinite',
        'blob-slow': 'blob-slow 10s ease-in-out infinite',
      },
      keyframes: {
        'status-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'breath-deep': {
          '0%, 100%': { transform: 'scale(0.94)', opacity: '0.45' },
          '50%': { transform: 'scale(1.04)', opacity: '0.75' },
        },
        'soft-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'oscilloscope-drift': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        'oscilloscope-glow': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'color-shift-luna': {
          '0%, 100%': { color: '#6d28d9' },
          '33%': { color: '#ff5a40' },
          '66%': { color: '#0e7490' },
        },
        'color-shift-luna-suffix': {
          '0%, 100%': { color: '#f59e0b' },
          '25%': { color: '#ec4899' },
          '50%': { color: '#8b5cf6' },
          '75%': { color: '#14b8a6' },
        },
        'bg-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'blob-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -10px, 0) scale(1.06)' },
        },
      },
    },
  },
};
