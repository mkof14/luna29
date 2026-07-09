# Production Rollback — Luna29

**Critical:** Code rollback ≠ database restore ≠ Stripe kill switch. Choose the right lever.

Related: `docs/DEPLOY_RESTORE_POINTS.md` · `docs/BACKUP_RECOVERY.md` · `docs/INCIDENT_RESPONSE.md`

---

## A. Code rollback

**When:** Bad deploy, logic bug, UI/API regression without data corruption.

1. Identify last known-good deploy tag/SHA (`DEPLOY_RESTORE_POINTS.md`).
2. Vercel: **Promote** previous Production deployment, or redeploy the good git ref.
3. Confirm public liveness + protected readiness.
4. Run smoke.

Does **not** undo Postgres writes that already happened.

---

## B. Configuration rollback

**When:** Bad env var, wrong Origin list, mis-set feature flag.

1. Revert the specific Vercel Production env var(s).
2. Redeploy or restart so serverless picks up env (Vercel usually requires redeploy for some vars).
3. Re-run `verify:prod` / readiness.

Examples: `AUTH_ALLOWED_ORIGINS`, `STRIPE_*` URLs, `HEALTH_VERBOSE_SECRET` (rotate carefully).

---

## C. Stripe kill switch

**When:** Payment risk, webhook poison, need to stop new checkouts.

1. Set `STRIPE_BILLING_ENABLED=false` in Vercel Production.
2. Redeploy if required.
3. Confirm health `billing: disabled`.
4. Existing Stripe subscriptions still exist in Stripe — this stops Luna billing API paths that require enabled billing; reconcile carefully before re-enabling.

---

## D. Database restore

**When:** Data corruption, accidental mass delete, unrecoverable projection damage.

Follow `docs/BACKUP_RECOVERY.md` end-to-end.

**Not** a substitute for code rollback. After restore, reconcile Stripe + webhooks + deletion ops.

---

## E. AI / voice disable or degrade

**When:** Gemini/ElevenLabs outage or cost incident.

| Lever | Effect |
| --- | --- |
| Remove/rotate `GEMINI_API_KEY` | Local text fallback (`degraded`) |
| Remove/rotate `ELEVENLABS_API_KEY` | Text preserved; browser TTS fallback |
| Rate limits | Already fail-closed without Upstash in prod |

Do not invent a new UX — existing partial/degraded contract applies.

---

## F. Rate-limit backend failure

**When:** Upstash/KV down.

- Production-like: rate limiter **fail closed** (requests denied) — not memory fallback.
- Mitigate: restore Upstash credentials/URL; confirm readiness `rateLimit: upstash`.
- Temporary: reduce traffic / maintenance page if auth is unusable due to fail-closed.

---

## Decision guide

| Symptom | First lever |
| --- | --- |
| New code bug | A Code |
| Wrong env | B Config |
| Charging / checkout danger | C Stripe kill switch |
| Corrupt or lost rows | D Database restore |
| Voice provider outage | E AI/voice degrade |
| All mutating APIs 429 | F Rate-limit backend |
