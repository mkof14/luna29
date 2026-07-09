# Backup and Recovery — Luna29

**Status:** Operator runbook for early commercial beta
**Architecture assumption:** Postgres via `DATABASE_URL` (repo comments and verifier treat **Neon** as the intended managed provider).
**Do not treat this document as a contractual SLA.**

Related: `docs/DEPLOY_RESTORE_POINTS.md` (code deploy tags) · `docs/PRODUCTION_ROLLBACK.md` · `docs/INCIDENT_RESPONSE.md`

---

## 1. Postgres provider assumption

| Item | Evidence in repo | Operator action |
| --- | --- | --- |
| Durable state | `DATABASE_URL` required in production/preview (`durableStorageGuard`, verifier) | Provision managed Postgres |
| Provider intent | `server/core/database.mjs` notes Neon/serverless; verifier mentions Neon | Confirm Neon project (or equivalent) owns `DATABASE_URL` |
| Connection | Shared `pg` pool singleton — **no second pool** | Keep one production database URL |

---

## 2. Neon backup / PITR

| Capability | Verified in repo? | Notes |
| --- | --- | --- |
| Automated backups | **Not verified in code** | Depends on Neon project plan/settings |
| Point-in-time recovery (PITR) | **Not claimed enabled** | Operator must confirm in Neon console |
| Branch restore | **Operator setup required** | Prefer restore-to-branch then cutover |

**Operator checklist (required before go-live):**

1. Confirm Neon project backup retention days.
2. Confirm whether PITR is enabled for the production branch.
3. Document the restore UI path and who has Neon admin access.
4. Record last successful restore drill date below.

---

## 3. Data domains (Postgres)

| Domain | Tables / stores | Notes |
| --- | --- | --- |
| Auth | `auth_users`, `auth_sessions` | Session invalidation after restore may be required |
| Billing | `billing_*` accounts/subscriptions/trials | Reconcile with Stripe after restore |
| Webhooks | `stripe_webhook_events` | Ledger only — **no raw Stripe payloads** |
| Deletion ops | `account_deletion_ops` | Reconcile in-flight deletions |
| Personal events | `personal_events` (+ related signal/pattern tables) | User health memory foundation |
| Memory consent | memory consent store (Postgres in prod) | Consent flags |
| Calendar / mobile | `calendar_user_data`, `mobile_*` | User data storage mode |
| Operational records | admin invites/audit/workspace, privacy, contacts | Admin/ops |

JSON/file modes are **dev/test only** and must not be production authority.

---

## 4. Proposed production targets (early beta)

| Metric | Minimum | Target (if provider supports) | Label |
| --- | --- | --- | --- |
| RPO | ≤ 24h | ≤ 1h with PITR | **Recommended starting targets — not verified capability** |
| RTO | ≤ 4h | ≤ 4h | Early commercial beta |

Do **not** advertise these as contractual SLAs.

---

## 5. Restore procedure

1. **Decide maintenance** — stop or drain writes if corruption risk is high (Incident Commander).
2. **Identify restore point** — Neon backup timestamp or PITR target (operator-confirmed).
3. **Restore database/branch** — prefer restore to a new branch; validate before cutover.
4. **Update `DATABASE_URL`** in Vercel Production only after validation (or swap branch endpoint).
5. **Verify schema** — app boot initializes idempotent `CREATE IF NOT EXISTS`; confirm critical tables exist.
6. **Run readiness** — `GET /api/health?verbose=1` with `HEALTH_VERBOSE_SECRET` / `x-luna-health-secret`.
7. **Run smoke** — `npm run smoke:deploy` (with secret for readiness).
8. **Verify auth** — sign-in, session, Google config (`AUTH_ALLOW_UNVERIFIED_GOOGLE=false`).
9. **Verify billing projection** — sample paid/trial users vs Stripe Dashboard.
10. **Verify webhook ledger** — admin `GET /api/admin/ops/stripe-webhooks` (failed/stale).
11. **Verify deletion ops** — no false-completed deletions; reconcile stuck ops.
12. **Reopen traffic** — clear maintenance; monitor 5xx and webhook backlog.

---

## 6. Quarterly restore drill

| Step | Owner role |
| --- | --- |
| Schedule drill | Engineering Lead |
| Restore to non-prod branch | Engineering Lead |
| Run readiness + smoke against branch | Engineering Lead |
| Record gaps | Incident Commander |
| Update this doc with date/result | Engineering Lead |

Last drill: `_YYYY-MM-DD — result — notes_`

---

## 7. Data consistency after restore

### Stripe reconciliation

- Compare local subscription statuses to Stripe Dashboard for active customers.
- Replay missed events from **Stripe Dashboard → Developers → Events → Resend** or `stripe events resend`.
- Ledger does **not** store raw payloads — automatic local replay is **not** possible.

### Webhook replay

- Use Stripe resend for `failed` / missed events.
- Watch admin webhook ops summary for `failed` and `stale_processing`.

### Account deletion reconciliation

- Inspect `account_deletion_ops` for non-terminal statuses.
- Never report success to a user if local cascade did not complete.
- Re-run deletion only via supported product/admin paths after Stripe cancel state is understood.

### Session invalidation

- After restore to an older point, consider mass session invalidation if session table is stale relative to security incident.
- Users may need to sign in again.

---

## Explicit non-claims

- This repo does **not** prove Neon PITR is enabled.
- This repo does **not** store Stripe raw webhook bodies for offline replay.
- Code rollback (`docs/PRODUCTION_ROLLBACK.md` §A) is **not** a database restore.
