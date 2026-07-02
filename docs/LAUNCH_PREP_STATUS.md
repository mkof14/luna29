# Luna Launch Prep Status

Updated: 2026-07-02 · **Release v1.2.0 completed** (`deploy/2026-07-02-1901-soft-launch-final`)

## Completed in This Block (2026-07-02 final)

### Soft launch final deploy
- Time-of-day member greetings (11 langs), live branded email sends from admin templates.
- Email hero JPEG pipeline, campaign mail reliability, consent audit logging.
- Google auth verified on production; `status:prod` + post-deploy smoke pass.
- Version index: `release/version.json` → `/version.json` + service worker cache key at build.

## Completed in Earlier Block (2026-07-02)

### Pre-launch audit remediation (status: completed)
- Broken assets fixed (`f5.webp`, hero preload), social links gated by env.
- Lang boot from URL, dynamic OG/canonical, i18n audit pass, deep-link routing.
- Perf budget pass, service worker registration (production), admin invite role on signup.
- Logo in menu/footer: moon mark only (no duplicate «Luna» under icon).
- Deploy checks: `status:prod` pass, local build + prerender pass.
- Version index: `release/version.json` + `/version.json` at build.

## Completed in Earlier Block (2026-06-28)

### Product & Messaging
- Privacy messaging aligned with architecture (local-first health data + optional server account/billing/AI).
- Pricing pillars and public pricing copy updated for freemium model.
- Freemium vs paid feature matrix on public pricing page.

### Monetization
- Centralized subscription access utility (`utils/subscriptionAccess.ts`).
- Bridge weekly limits: 2 free / unlimited for premium or active trial.
- Stripe checkout now supports configurable trial (`STRIPE_TRIAL_DAYS`, default 7) in both `api/index.mjs` and `server/index.mjs`.

### Analytics
- Consent-gated GA4 service (`services/analyticsService.ts`).
- Analytics initializes only after privacy consent.
- Env: `VITE_GA4_MEASUREMENT_ID`.

### Onboarding v2
- Added guided quick check-in step (energy + mood).
- First insight teaser before entering Today.
- Onboarding flow extended to 7 steps.

### Privacy / DSAR / Legal
- Server export response includes `exportVersion`, `audit`, and stable `requestId` filename.
- Local + server export paths preserved in Data Rights UI.
- **Legal substance localized in 11 languages** — see `utils/legal/*` and `docs/LEGAL_COUNSEL_REVIEW.md`.
- Effective date: June 29, 2026.

## Launch Channel Decision

**Web-first paid beta** (recommended and now aligned in product):
1. Public freemium + 7-day local trial + Stripe subscription.
2. Mobile store release as Phase 2 after web retention proof.

## Remaining Before Production Go-Live

### P0 (Must)
- [ ] Configure Vercel production env (auth, Stripe, Sentry, GA4).
- [ ] Stripe live products/prices + webhook in production.
- [ ] Legal counsel review: Terms, Privacy, Disclaimer, Cookies — **package ready** in `docs/LEGAL_COUNSEL_REVIEW.md`; awaiting sign-off.
- [ ] Assign release owner + rollback owner.
- [ ] Run production smoke: `SMOKE_BASE_URL=https://<domain> npm run smoke:deploy`

### P1 (Launch window)
- [ ] Server-side consent event logging for audit trail.
- [ ] On-call routing for Sentry/uptime alerts (Telegram secrets).
- [ ] 20–50 closed beta users with feedback capture.

### P2 (Mobile Phase 2)
- [ ] Native OAuth (Google/Apple) in mobile builds.
- [ ] Store IAP / Play Billing integration.
- [ ] Real push dispatch provider.
- [ ] App Store + Play metadata and submission.

## Storage note (Vercel / ephemeral)

When `DATABASE_URL` is not configured, server-side admin state, invites, billing snapshots, and contact submissions persist to JSON files under the runtime data directory. On Vercel serverless, `/tmp` is ephemeral and size-limited (~512 MB); data may reset between cold starts or deployments. For production, wire Postgres (`DATABASE_URL`) before relying on admin invites, audit logs, or billing state durability.

## Quality Gate

Run before go/no-go:

```bash
npm ci
npm run release:ready
```

Expected: lint, smoke, build, perf budget, E2E strict — all PASS.

## Next Step

1. Send legal package to counsel (`docs/LEGAL_COUNSEL_REVIEW.md`).
2. Execute 2-week plan (`docs/GO_NO_GO_2WEEK.md`) — assign owners Day 1.
3. Deploy to staging/production with env checklist from `docs/GO_LIVE_CHECKLIST.md`.
4. Run commercial smoke runbook (`docs/COMMERCIAL_SMOKE_RUNBOOK.md`).
5. Soft launch to 20–50 users.
6. Measure D7 retention and Bridge/report usage before mobile store push.
