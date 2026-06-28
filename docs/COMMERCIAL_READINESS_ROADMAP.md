# Luna Commercial Readiness Roadmap

## Implemented In Product (Code Complete)

### Privacy and Consent UX
- Global privacy controls banner and management panel.
- Consent options:
  - Essential only
  - Accept all
  - Granular toggles (analytics, AI processing, personalization)
- User can reopen privacy controls at any time.
- **Analytics consent gate:** GA4 loads only after analytics consent (`services/analyticsService.ts`).

### Data Rights Self-Service
- Data Rights page now includes working actions:
  - Export local Luna data as JSON
  - Delete local health data
  - Delete all local device data
- Local export includes all `luna_*` local storage keys.

### Backend DSAR Endpoints (P0 Core)
- Added authenticated API endpoints:
  - `POST /api/privacy/export`
  - `POST /api/privacy/correct`
  - `POST /api/privacy/delete`
  - `GET /api/privacy/requests`
- Requests are persisted in server storage (`privacy-requests.json`) with request IDs and status.
- Export returns server-side account/support artifacts (local-first note included).
- **Export v2:** response includes `exportVersion`, `audit`, stable `requestId` for downloads.

### Contact Path for Legal/Privacy
- Contact subject list includes `privacy` route (`privacy_legal`) for rights requests.

### Legal Content Improvement
- Privacy Notice now explicitly includes a Security Incident Response section.

### Billing Backend Foundation (Stripe)
- Added billing endpoints:
  - `POST /api/billing/checkout-session`
  - `GET /api/billing/status`
  - `POST /api/billing/webhook`
- Added environment configuration contract for Stripe in `.env.example`.
- Billing is feature-flagged via `STRIPE_BILLING_ENABLED=true`.
- **Stripe trial:** checkout supports `STRIPE_TRIAL_DAYS` (default 7).

### Freemium Product Model
- Centralized access rules in `utils/subscriptionAccess.ts`.
- Free tier: daily check-in, voice, basic rhythm, 2 Bridge/week.
- Paid/trial: patterns, reports, unlimited Bridge, full history.
- Public pricing page shows free vs paid matrix.

### Onboarding v2
- Guided first check-in (energy + mood) during onboarding.
- First insight teaser before entering Today.

### Messaging Alignment
- Pricing and context copy updated: health data local-first, server only for account/billing/optional AI.

---

## Remaining Before Commercial Launch

## P0 (Must Have Before Paid Launch)
- Complete Stripe production wiring (real prices, success/cancel routes, customer portal).
- ~~Add signed downloadable export file flow + immutable audit trail for DSAR.~~ **Partial:** export v2 audit metadata done; counsel review + signed file delivery pending.
- Add privacy request verification workflow (identity verification + SLA).
- Incident response runbook ownership and escalation contacts.
- Final legal review of Terms/Privacy/Disclaimer/Cookies/Data Rights by counsel.

## P1 (Should Have In Launch Window)
- ~~Consent event logging server-side for auditability.~~ **Partial:** client consent store done; server audit log pending.
- ~~Cookie consent enforcement for analytics scripts (block until consent).~~ **Done:** GA4 gated by privacy consent.
- Data retention policy engine (TTL + scheduled deletion jobs).
- Role-based admin hardening (mandatory 2FA for admin accounts).
- Uptime and error alert routing to on-call channel.

## P2 (Post-Launch Hardening)
- Formal DSAR admin dashboard.
- Automated compliance evidence pack exports.
- Quarterly privacy and security review process.

---

## Suggested Execution Order
1. Billing backend and webhook correctness.
2. DSAR server APIs (`export/delete/correct`) with identity verification.
3. Consent logging + analytics gating.
4. Incident runbook + on-call ownership.
5. Legal sign-off and release checklist freeze.
