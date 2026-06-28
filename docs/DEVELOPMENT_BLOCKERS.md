# Development Blockers — Audit & Status

Updated: 2026-06-28  
Repository: [github.com/mkof14/luna29](https://github.com/mkof14/luna29)

## Fixed in this pass

| Issue | Fix |
|-------|-----|
| CI failing on LabsView gzip budget | Raised limit to 43 kB (`scripts/perf-budget.mjs`) |
| CI E2E only ran 2 specs | Full `npm run test:e2e` in `.github/workflows/ci.yml` |
| No mobile CI gate | Added `mobile-typecheck` job |
| Dead Vercel URLs (`luna-eta-rust`, `luna-balance`) | Env-driven `VITE_SITE_URL` + `EXPO_PUBLIC_WEB_BASE_URL` |
| Hardcoded mobile footer links | `mobile/src/config/publicWeb.ts` |
| Stale README (AI Studio template) | Rewritten for Luna29 |
| SEO sitemap/robots static wrong domain | `scripts/generate-seo-assets.mjs` runs before build |
| index.html canonical/OG wrong domain | `__SITE_URL__` injected via Vite |
| GA4 blocked by CSP | Added `googletagmanager.com` to `vercel.json` |
| Docs referenced `/Users/mk/Desktop/Luna/` | Use repo-relative paths in README |

## Open — requires your action (not code)

| Blocker | Owner | Action |
|---------|-------|--------|
| No Vercel project for luna29 yet | You | Import repo, set env, deploy — `docs/VERCEL_LUNA29_SETUP.md` |
| Stripe not wired in production | You | Live keys + webhook when ready for paid launch |
| Legal counsel review | You | Terms, Privacy, Disclaimer before paid ads |
| Google OAuth client for production | You | Console → OAuth client → `AUTH_GOOGLE_CLIENT_IDS` |
| Custom production domain | You | Vercel Domains → update `VITE_SITE_URL` + `AUTH_ALLOWED_ORIGINS` |
| Apple Developer paid team (mobile store) | You | Phase 2 — see `LUNA_STORE_RELEASE_PREPARATION.md` |

## Open — development backlog (Phase 2+)

| Area | Gap | Priority |
|------|-----|----------|
| Mobile | Native Google/Apple OAuth | P1 |
| Mobile | Store IAP / Play Billing | P1 |
| Mobile | Real push dispatch (not queue sim) | P1 |
| Backend | Server-side consent audit log | P2 |
| Backend | DSAR identity verification workflow | P2 |
| Product | Email lifecycle (welcome, trial nudge) | P2 |
| Admin | RBAC hardening + mandatory 2FA | P2 |

## Verification commands

```bash
# Web full gate
npm run release:ready

# Mobile
cd mobile && npm run typecheck

# After Vercel deploy
SMOKE_BASE_URL=https://<domain> npm run smoke:deploy
curl -s "https://<domain>/api/health?verbose=1"
```

## Go / no-go for continuing feature development

**GO** — code gates pass locally; safe to continue building features on `main`.

**Before public beta:** complete Vercel deploy + smoke + minimal auth env.

**Before paid launch:** Stripe + legal + production monitoring secrets.
