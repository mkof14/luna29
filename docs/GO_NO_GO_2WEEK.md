# Go / No-Go Checklist — 2 Weeks to Paid Beta

Updated: 2026-06-29  
Target launch window: **paid web beta (20–50 users)**  
Decision meeting: **Day 14 (Friday), 30 min**

Fill **Owner** with a name before starting. Use **Status**: `⬜ todo` · `🔄 in progress` · `✅ done` · `⛔ blocked`

References: `docs/GO_LIVE_CHECKLIST.md` · `docs/LEGAL_COUNSEL_REVIEW.md` · `docs/COMMERCIAL_SMOKE_RUNBOOK.md` · `docs/VERCEL_LUNA29_SETUP.md`

---

## Week 1 — Foundation (Days 1–7)

### Day 1 — Mon · Ownership & legal kickoff

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 1.1 | Assign **Release owner**, **Rollback owner**, **On-call owner** | Founder / Product | ⬜ | Names in this doc |
| 1.2 | Fix go/no-go meeting time (Day 14) + invite stakeholders | Release owner | ⬜ | Calendar hold |
| 1.3 | Send `docs/LEGAL_COUNSEL_REVIEW.md` + staging links to counsel | Legal / Founder | ⬜ | Email sent |
| 1.4 | Confirm legal entity name, privacy contact email, support address for legal copy | Founder | ⬜ | Written in Notion/doc |

### Day 2 — Tue · Staging deploy & repo gate

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 2.1 | Connect Vercel project to `main`; confirm preview deploys | Engineering | ⬜ | Preview URL works |
| 2.2 | Run `npm run ci:check` on release candidate commit | Engineering | ⬜ | All PASS |
| 2.3 | Run `npm run release:ready` | Engineering | ⬜ | PASS report saved |
| 2.4 | Spot-check legal pages in EN + RU on preview (`/privacy`, `/terms`, `/disclaimer`, `/cookies`, `/data-rights`) | QA / Product | ⬜ | Substance localized, not EN fallback |

### Day 3 — Wed · Production environment (auth + infra)

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 3.1 | Set production domain + SSL on Vercel | Engineering | ⬜ | `https://www.luna29.com` resolves |
| 3.2 | Configure auth env: `AUTH_ALLOWED_ORIGINS`, `AUTH_GOOGLE_CLIENT_IDS`, `AUTH_ALLOW_UNVERIFIED_GOOGLE=false` | Engineering | ⬜ | Google sign-in works on prod |
| 3.3 | Set `SUPER_ADMIN_EMAILS`; rotate bootstrap password after first login | Engineering | ⬜ | Admin access verified |
| 3.4 | Provision **Postgres** (`DATABASE_URL`) — no ephemeral-only storage | Engineering | ⬜ | `/api/health?verbose=1` → `database: postgres` |
| 3.5 | Provision **Upstash/KV** rate limiting | Engineering | ⬜ | health → `rateLimit: upstash` |

### Day 4 — Thu · Observability & analytics

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 4.1 | Set `VITE_SENTRY_DSN`, `VITE_SENTRY_ENV`, `VITE_APP_RELEASE` | Engineering | ⬜ | Test error appears in Sentry |
| 4.2 | Set `VITE_GA4_MEASUREMENT_ID`; verify consent-gated init | Engineering | ⬜ | Events only after consent |
| 4.3 | Configure uptime workflow secrets (`UPTIME_BASE_URL`, optional Telegram) | On-call owner | ⬜ | Cron alert test received |
| 4.4 | Document incident channel (Slack/Telegram/email) | On-call owner | ⬜ | Link in runbook |

### Day 5 — Fri · Stripe test mode E2E

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 5.1 | Stripe **test** products/prices; webhook to staging/prod URL | Engineering | ⬜ | Webhook 200 in Stripe dashboard |
| 5.2 | Set billing env (`STRIPE_*`, `STRIPE_BILLING_ENABLED=true` on staging first) | Engineering | ⬜ | Checkout opens |
| 5.3 | Manual E2E: checkout → success URL → portal → cancel path | QA | ⬜ | Checklist in smoke runbook signed |
| 5.4 | Verify freemium gates (Bridge 2/wk, trial, premium unlock) | QA | ⬜ | Matches `subscriptionAccess` rules |

### Day 6–7 — Weekend buffer · Counsel + smoke

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 6.1 | Counsel initial redlines received | Legal counsel | ⬜ | Redline doc or email |
| 6.2 | Merge critical counsel fixes to `utils/legal/*` (if any) | Engineering + Legal | ⬜ | PR merged |
| 6.3 | Run `SMOKE_BASE_URL=https://<staging> npm run smoke:deploy` | QA | ⬜ | 8/8 checks pass |
| 6.4 | Week 1 checkpoint: any P0 blocker? | Release owner | ⬜ | Written go/pause note |

---

## Week 2 — Launch (Days 8–14)

### Day 8 — Mon · Legal sign-off & production deploy

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 8.1 | **Counsel sign-off** recorded (name + date) on EN legal set | Legal counsel | ⬜ | Approval on file |
| 8.2 | Update effective date in `utils/legal/types.ts` if counsel requires | Engineering | ⬜ | Matches approval |
| 8.3 | Production deploy from signed commit | Engineering | ⬜ | Deploy green |
| 8.4 | `npm run verify:prod` / `status:prod` | Engineering | ⬜ | Script PASS |

### Day 9 — Tue · Stripe live & billing smoke

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 9.1 | Switch to Stripe **live** keys + live webhook secret | Engineering | ⬜ | Live mode in dashboard |
| 9.2 | `STRIPE_BILLING_ENABLED=true` on production | Engineering | ⬜ | Paid CTA active |
| 9.3 | Live smoke: one real subscription + refund/cancel test plan | QA + Founder | ⬜ | Documented transaction IDs |
| 9.4 | Rollback drill: set `STRIPE_BILLING_ENABLED=false`, redeploy | Rollback owner | ⬜ | Paid path disabled < 15 min |

### Day 10 — Wed · Security & compliance gate

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 10.1 | Confirm `AUTH_ALLOW_UNVERIFIED_GOOGLE=false` on prod | Engineering | ⬜ | health check |
| 10.2 | Confirm CSP/HSTS headers on prod (`vercel.json`) | Engineering | ⬜ | securityheaders.com or curl |
| 10.3 | DSAR flow: export + delete on prod test account | QA | ⬜ | API + UI success |
| 10.4 | Privacy banner + consent persists correctly | QA | ⬜ | Refresh retains choice |

### Day 11 — Thu · Beta cohort

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 11.1 | Invite 20–50 beta users (email list / waitlist) | Product / Founder | ⬜ | Invites sent |
| 11.2 | Feedback channel live (form, email, or Discord) | Product | ⬜ | Link in welcome email |
| 11.3 | Monitor Sentry + uptime for first 24h user activity | On-call owner | ⬜ | No P0 crashes |
| 11.4 | Track activation: sign-up → onboarding → first check-in | Product | ⬜ | Baseline metrics doc |

### Day 12 — Fri · Full production smoke

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 12.1 | `SMOKE_BASE_URL=https://www.luna29.com npm run smoke:deploy` | QA | ⬜ | All pass |
| 12.2 | Manual critical flows per `COMMERCIAL_SMOKE_RUNBOOK.md` | QA | ⬜ | Signed runbook |
| 12.3 | Lighthouse on prod home (perf ≥0.7, a11y ≥0.9) | Engineering | ⬜ | Scores recorded |
| 12.4 | Re-run `npm run ci:check` on release tag | Engineering | ⬜ | PASS |

### Day 13 — Mon · Pre-decision review

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 13.1 | Compile open issues list (P0 / P1 / defer) | Release owner | ⬜ | Shared doc |
| 13.2 | Confirm rollback owner available for launch week | Rollback owner | ⬜ | Acknowledged |
| 13.3 | Beta feedback summary (top 3 bugs + top 3 praises) | Product | ⬜ | 1-page summary |
| 13.4 | Legal: any post-sign-off copy still pending? | Legal | ⬜ | Yes/No explicit |

### Day 14 — Tue · **Go / No-Go meeting**

| # | Task | Owner | Status | Gate |
|---|------|-------|--------|------|
| 14.1 | Review all ⬜ items above — **zero open P0** required for GO | Release owner | ⬜ | |
| 14.2 | Health: `GET /api/health?verbose=1` → `ok: true` | Engineering | ⬜ | |
| 14.3 | Auth + billing + legal routes verified live | QA | ⬜ | |
| 14.4 | **Decision recorded:** GO / NO-GO / GO with limits | All | ⬜ | Minutes saved |

---

## Go / No-Go Rules

### GO (paid beta) only if ALL true:

- Counsel sign-off on EN legal set (Day 8.1)
- Postgres + Upstash on production
- Stripe live checkout + webhook verified once
- Production smoke + commercial runbook signed
- Release + rollback owners assigned
- No open P0 bugs (crash, auth broken, billing broken, legal pages 404)

### NO-GO if ANY true:

- Legal sign-off missing
- Ephemeral-only storage on prod
- Billing checkout fails on live
- `/api/health` reports `ok: false`
- Unassigned rollback owner

### GO with limits (acceptable):

- P1 items deferred with dated owners (e.g. DSAR identity verification, server-side consent audit log)
- Mobile store launch explicitly out of scope (Phase 2)
- Beta capped at 50 users until D7 retention reviewed

---

## Rollback (if NO-GO after partial launch)

| Step | Action | Owner |
|------|--------|-------|
| 1 | `STRIPE_BILLING_ENABLED=false` on Vercel | Rollback owner |
| 2 | Redeploy previous known-good commit | Engineering |
| 3 | Verify auth + `/api/health` | QA |
| 4 | Notify beta users; pause invites | Product |
| 5 | Post-mortem within 48h | Release owner |

---

## Owner roster (fill in)

| Role | Name | Contact |
|------|------|---------|
| Release owner | | |
| Rollback owner | | |
| On-call owner | | |
| Engineering lead | | |
| QA lead | | |
| Legal counsel | | |
| Product / Founder | | |

---

## Quick commands

```bash
npm run ci:check
npm run release:ready
SMOKE_BASE_URL=https://www.luna29.com npm run smoke:deploy
npm run verify:prod
```
