# Production Release Checklist — Luna29

Consolidates release gates for commercial web. References (do not duplicate blindly):

- `docs/GO_LIVE_CHECKLIST.md`
- `docs/GO_NO_GO_2WEEK.md`
- `docs/COMMERCIAL_SMOKE_RUNBOOK.md`
- `docs/DEPLOY_RESTORE_POINTS.md`
- `docs/VERCEL_STRIPE_PRODUCTION_CHECKLIST.md`
- `docs/GO_NO_GO.md` (hard blockers)
- `docs/BACKUP_RECOVERY.md`
- `docs/PRODUCTION_ROLLBACK.md`

Fill **Owner role** and **Status**: `⬜` · `🔄` · `✅` · `⛔`

---

## Pre-release git / build

| # | Check | Owner | Status |
| --- | --- | --- | --- |
| 1 | Clean git status except explicitly accepted files (e.g. local `public/version.json` if build-generated) | Engineering Lead | ⬜ |
| 2 | Expected commit SHA recorded | Engineering Lead | ⬜ |
| 3 | No unpushed ambiguity — release commit is on remote tracking branch | Engineering Lead | ⬜ |
| 4 | `npx tsc --noEmit` + unit suite green on release commit | Engineering Lead | ⬜ |
| 5 | Vite production build succeeds | Engineering Lead | ⬜ |

---

## Environment & infrastructure

| # | Check | Owner | Status |
| --- | --- | --- | --- |
| 6 | `npm run verify:prod` pass (no secret values printed) | Engineering Lead | ⬜ |
| 7 | DB readiness pass (protected `/api/health?verbose=1`) | Engineering Lead | ⬜ |
| 8 | Durable rate limiter ready (`rateLimit: upstash`) | Engineering Lead | ⬜ |
| 9 | Stripe config ready if billing enabled | Engineering Lead | ⬜ |
| 10 | Stripe webhook secret ready + endpoint verified | Engineering Lead | ⬜ |
| 11 | `AUTH_ALLOWED_ORIGINS` explicit (no `*`, no localhost in prod) | Engineering Lead | ⬜ |
| 12 | Google verification safe (`AUTH_ALLOW_UNVERIFIED_GOOGLE=false`) | Engineering Lead | ⬜ |
| 13 | `SUPER_ADMIN_EMAILS` configured; bootstrap password rotated after first use | Engineering Lead | ⬜ |
| 14 | `HEALTH_VERBOSE_SECRET` configured | Engineering Lead | ⬜ |
| 15 | Gemini server key configured if AI features enabled | Engineering Lead | ⬜ |
| 16 | ElevenLabs key configured if voice TTS enabled | Engineering Lead | ⬜ |
| 17 | No dangerous local auth fallback in production | Engineering Lead | ⬜ |
| 18 | No file personal-events storage in production | Engineering Lead | ⬜ |
| 19 | No emergency reset key unless explicitly accepted | Security Lead | ⬜ |

---

## Data protection & legal

| # | Check | Owner | Status |
| --- | --- | --- | --- |
| 20 | Legal links present (privacy, terms, disclaimer, cookies, data-rights) | Customer Communications | ⬜ |
| 21 | Account deletion tested (no false success) | Engineering Lead | ⬜ |
| 22 | Backup capability verified in provider console (see `BACKUP_RECOVERY.md`) | Engineering Lead | ⬜ |
| 23 | Restore procedure reviewed by Incident Commander | Incident Commander | ⬜ |

---

## Product smoke (commercial)

| # | Check | Owner | Status |
| --- | --- | --- | --- |
| 24 | Smoke pass (`smoke:deploy` / commercial runbook) | Engineering Lead | ⬜ |
| 25 | Paid checkout test | Engineering Lead | ⬜ |
| 26 | Customer portal test | Engineering Lead | ⬜ |
| 27 | Webhook test (deliver + ledger) | Engineering Lead | ⬜ |
| 28 | New user trial / free-path test per current product rules | Engineering Lead | ⬜ |
| 29 | Premium denial test (non-entitled blocked) | Engineering Lead | ⬜ |
| 30 | Mobile Bearer auth test | Engineering Lead | ⬜ |

---

## Signoff

| # | Check | Owner | Status |
| --- | --- | --- | --- |
| 31 | Final go/no-go owner signoff (`docs/GO_NO_GO.md`) | Incident Commander | ⬜ |

**Release commit:** `________________`
**Signoff date (UTC):** `________________`
