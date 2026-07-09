# Go / No-Go — Hard Blockers (Commercial Web)

This is the **decision gate** for production traffic.
Timeline planning lives in `docs/GO_NO_GO_2WEEK.md`. Release tasks live in `docs/PRODUCTION_RELEASE_CHECKLIST.md`.

**Decision owner:** Incident Commander (or Release owner if designated)
**Any HARD blocker = NO-GO.**

---

## HARD blockers (must be clear)

| # | Blocker | Evidence of clear |
| --- | --- | --- |
| H1 | Durable Postgres unavailable | Protected readiness `database: postgres`, `postgresProbe: ok` |
| H2 | Rate limiter not durable | `rateLimit: upstash` (memory/unavailable = NO-GO) |
| H3 | `AUTH_ALLOW_UNVERIFIED_GOOGLE` true in prod | `/api/auth/config` + env |
| H4 | `AUTH_ALLOWED_ORIGINS` missing / wildcard / localhost in prod | Protected readiness warnings + env |
| H5 | Billing enabled but Stripe misconfigured | `billing: misconfigured` or missing `STRIPE_*` |
| H6 | Billing enabled but webhook ledger not postgres | `stripeWebhookLedger: postgres` |
| H7 | `HEALTH_VERBOSE_SECRET` missing | Verifier + Vercel env |
| H8 | Super-admin env missing | `SUPER_ADMIN_EMAILS` present |
| H9 | Account deletion false-success possible | Deletion suites pass; ops table reachable |
| H10 | Backup capability unknown | Operator confirmed Neon backups (see `BACKUP_RECOVERY.md`) — PITR optional but backups required |
| H11 | Public health leaks topology/secrets | Public `/api/health` is liveness-only |
| H12 | Unresolved SEV1 | No open SEV1 |

---

## Soft warnings (may GO with documented risk)

| # | Warning | Mitigation |
| --- | --- | --- |
| S1 | Gemini unconfigured | Live degrades to local text |
| S2 | ElevenLabs unconfigured | Text-only / browser TTS |
| S3 | Billing intentionally disabled | Soft launch OK if product allows |
| S4 | `ADMIN_EMERGENCY_RESET_KEY` set | Document acceptance + rotation plan |
| S5 | Client Sentry DSN missing | Server structured logs still required |

---

## Signoff

| Role | Name/handle | GO / NO-GO | UTC |
| --- | --- | --- | --- |
| Incident Commander | | | |
| Engineering Lead | | | |
| Security Lead (if SEV1/auth/data) | | | |

**Release SHA:** `________________`

If **NO-GO**: list open HARD blockers and next checkpoint time. Do not “soft launch” past HARD blockers.
