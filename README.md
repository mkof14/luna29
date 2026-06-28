# Luna29

Women's health understanding system — web PWA + Expo mobile app.

Repository: [github.com/mkof14/luna29](https://github.com/mkof14/luna29)

## Stack

- **Web:** React 19 + Vite + TypeScript + Tailwind
- **API:** Vercel Functions (`api/index.mjs`) + local dev server (`server/index.mjs`)
- **Mobile:** Expo React Native (`mobile/`)

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev          # frontend only (API proxied to localhost:8787)
npm run dev:full     # frontend + local API server
```

Mobile:

```bash
cd mobile && npm install && cp .env.example .env
npm start
```

## Quality gates

```bash
npm run ci:check           # lint + smoke + build + perf
npm run qa:beta:strict     # ci:check + full E2E
npm run release:ready      # strict QA + release report
```

## Deploy (Vercel)

1. Import **mkof14/luna29** at [vercel.com/new](https://vercel.com/new)
2. Build: `npm run build` | Output: `dist`
3. Set env vars — see `docs/VERCEL_LUNA29_SETUP.md`
4. Post-deploy smoke:

```bash
SMOKE_BASE_URL=https://your-domain.vercel.app npm run smoke:deploy
```

## Key docs

| Doc | Purpose |
|-----|---------|
| `docs/VERCEL_LUNA29_SETUP.md` | First Vercel deploy + env |
| `docs/GO_LIVE_CHECKLIST.md` | Commercial launch checklist |
| `docs/LAUNCH_PREP_STATUS.md` | Current readiness status |
| `docs/DEVELOPMENT_BLOCKERS.md` | Known issues + fixes |
| `docs/COMMERCIAL_READINESS_ROADMAP.md` | Compliance + billing roadmap |
| `mobile/MOBILE_PARITY_MATRIX.md` | Web vs mobile parity |

## Architecture

- App: `App.tsx`
- Health model: `hooks/useHealthModel.ts`
- Router: `components/MainContentRouter.tsx`
- Rule engine: `services/ruleEngine.ts`
- Subscription access: `utils/subscriptionAccess.ts`

## Environment

Web: `.env.example` — set `VITE_SITE_URL` to your production domain for SEO assets.

Mobile: `mobile/.env.example` — set `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_WEB_BASE_URL`.
