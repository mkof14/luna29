# Incident Response — Luna29

**Roles (no named employees):** Incident Commander · Engineering Lead · Security Lead · Customer Communications

Related: `docs/BACKUP_RECOVERY.md` · `docs/PRODUCTION_ROLLBACK.md` · `docs/GO_NO_GO.md`

---

## Severity definitions

### SEV1 — immediate all-hands

| Examples |
| --- |
| Auth bypass |
| Cross-user data exposure |
| Account deletion failure with false success |
| Payment / billing projection corruption |
| Broad production outage |
| Secret exposure |

| Phase | Action |
| --- | --- |
| Detection | Alerts, user reports, admin audit, Sentry/client errors, ops logs (`api_5xx`, auth failures) |
| Immediate | Incident Commander declares SEV1; freeze risky deploys |
| Containment | Revoke keys, disable feature flags/env kill switches, Origin/auth lockdown, Stripe kill switch if payment risk |
| Owner | Incident Commander + Security Lead (exposure) / Engineering Lead (outage) |
| Communication | Customer Communications — decide public status vs private outreach |
| Recovery | Fix forward or rollback per `PRODUCTION_ROLLBACK.md`; verify readiness |
| Post-incident | Blameless review within 5 business days; track actions |

### SEV2 — major degradation

| Examples |
| --- |
| Major feature outage (auth for many users, billing checkout) |
| Voice unavailable (Gemini/ElevenLabs) |
| Webhook backlog / stale processing |
| Billing projection stale |
| Database degradation |

Same phase table as SEV1 with narrower blast radius; Customer Communications optional unless paid users impacted.

### SEV3 — partial / isolated

| Examples |
| --- |
| Partial degradation |
| Isolated errors |
| Non-critical admin issue |

Engineering Lead owns; document in next standup; no all-hands.

---

## Playbooks

### Auth incident

1. Confirm scope (bypass vs outage vs session theft).
2. Rotate session secrets / invalidate sessions if compromise suspected.
3. Set `AUTH_ALLOW_UNVERIFIED_GOOGLE=false`; verify `AUTH_ALLOWED_ORIGINS`.
4. Check super-admin list; rotate bootstrap password if used.
5. Preserve logs with `request_id` (no cookies/tokens in logs by design).

### Database incident

1. Check protected readiness (`/api/health?verbose=1` + secret) — postgres probe.
2. Do not open a second pool; fix `DATABASE_URL` / Neon status.
3. If corruption: maintenance + restore per `BACKUP_RECOVERY.md`.
4. After restore: Stripe + deletion ops reconciliation.

### Stripe incident

1. Confirm whether money moved incorrectly vs projection-only drift.
2. Kill switch: `STRIPE_BILLING_ENABLED=false` if needed (config rollback).
3. Pause webhook processing only if poison events; prefer fix + Stripe resend.
4. Reconcile Dashboard vs local billing tables.

### Webhook backlog

1. Admin: `GET /api/admin/ops/stripe-webhooks` (admin auth required).
2. Inspect `failed` and `stale_processing` (metadata only).
3. Replay from Stripe Dashboard / `stripe events resend` — raw body not stored locally.
4. Watch ops events: `stripe_webhook_processed|failed|duplicate|ignored|in_progress`.

### Gemini outage

1. Voice path falls back to local text (`degraded`); no transcript in logs.
2. Confirm config readiness (not spend probes) via protected health.
3. Communicate SEV2 if Live is primary beta surface.
4. Do not disable unrelated product surfaces.

### ElevenLabs outage

1. Text reply preserved; `ttsError` / `partial` when TTS fails — not silent false success.
2. Browser TTS fallback remains available to clients.
3. Monitor `elevenlabs_latency` / voice ops events.

### Account deletion incident

1. Never claim success if `deleted: false`.
2. Inspect `account_deletion_ops` statuses; ops events for external/local failure.
3. If false success suspected → SEV1 + Security Lead.
4. Reconcile Stripe cancel state before retry.

### Suspected data exposure

1. SEV1 — Security Lead owns containment.
2. Revoke sessions; rotate secrets; assess personal_events / billing exposure.
3. Customer Communications for affected users after facts are solid.
4. Preserve forensic logs; do not dump PII into chat tools.

---

## Communication decision matrix

| Severity | External status page / email | Internal channel |
| --- | --- | --- |
| SEV1 | Usually yes if user data/payment/auth | Immediate |
| SEV2 | If paid path broken >30m | Immediate |
| SEV3 | Rarely | Async |

---

## Detection signals (existing)

- Structured `http_request` / `ops_event` / `server_error` logs
- Client Sentry (consent-gated marketing analytics ≠ server error reporting)
- Protected readiness probes
- Admin webhook ops endpoint
- Uptime / smoke scripts
