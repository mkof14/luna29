# Luna Go-Live Checklist

Single source checklist for commercial production launch.

## 0. Scope and Ownership
- Release owner assigned.
- Go/no-go meeting time fixed.
- Rollback owner assigned.

## 1. Infrastructure and Deploy
1. Vercel project connected to `main`.
2. Build pipeline green on latest commit.
3. API routing verified:
   - `/api/*` -> `api/index.mjs`
4. Production domain and SSL active.

Reference:
- `/Users/mk/Desktop/Luna/docs/VERCEL_STRIPE_PRODUCTION_CHECKLIST.md`

## 2. Environment Variables (Production)
1. Frontend vars configured:
   - `VITE_ENABLE_AI`
   - `VITE_SENTRY_DSN`
   - `VITE_SENTRY_ENV`
   - `VITE_APP_RELEASE`
   - `VITE_GA4_MEASUREMENT_ID`
2. Auth vars configured:
   - `SUPER_ADMIN_EMAILS`
   - `SUPER_ADMIN_BOOTSTRAP_PASSWORD`
   - `AUTH_ALLOWED_ORIGINS`
   - `AUTH_GOOGLE_CLIENT_IDS`
   - `AUTH_ALLOW_UNVERIFIED_GOOGLE=false`
3. Billing vars configured:
   - `STRIPE_BILLING_ENABLED`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_MONTHLY_ID`
   - `STRIPE_PRICE_YEARLY_ID`
   - `STRIPE_SUCCESS_URL`
   - `STRIPE_CANCEL_URL`
   - `STRIPE_PORTAL_RETURN_URL`
   - `STRIPE_TRIAL_DAYS=7`

## 3. Stripe Readiness
1. Products/prices exist in Stripe.
2. Webhook endpoint configured:
   - `https://<domain>/api/billing/webhook`
3. Required events enabled:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Webhook signing secret copied to production env.

## 4. Security and Compliance Gate
1. `AUTH_ALLOW_UNVERIFIED_GOOGLE` is `false`.
2. Bootstrap super-admin password rotated after bootstrap.
3. Trusted origins only in `AUTH_ALLOWED_ORIGINS`.
4. Legal pages reviewed and published:
   - Terms
   - Privacy
   - Disclaimer
   - Cookies
   - Data Rights
5. Incident escalation channel and on-call owner confirmed.

Reference:
- `/Users/mk/Desktop/Luna/docs/COMMERCIAL_READINESS_ROADMAP.md`

## 5. CI and Local Quality Gate
Run on release candidate commit:

```bash
npm run ci:check
npm run qa:beta:strict
```

Expected:
- Lint/typecheck passes.
- Smoke tests pass.
- Build and perf budget pass.
- E2E strict pass.

## 6. Production Smoke Gate (5-10 min)
1. Run deploy smoke:

```bash
SMOKE_BASE_URL=https://<your-domain> npm run smoke:deploy
```

2. Check diagnostics:
   - `GET /api/health?verbose=1`
   - Expect `ok: true`
3. Validate manual critical flows:
   - Public pages and navigation
   - Member sign-in, dashboard, reports/labs, profile
   - Billing checkout + return + portal
   - Privacy/Data Rights requests

Reference:
- `/Users/mk/Desktop/Luna/docs/COMMERCIAL_SMOKE_RUNBOOK.md`

## 7. Go/No-Go Rules
- Go only if all sections 1-6 pass.
- No-go if any of these fail:
  - Health endpoint reports `ok: false`
  - Auth flow fails
  - Billing checkout/portal fails
  - Critical layout break on public/member pages

## 8. Rollback
1. Disable paid path quickly:
   - `STRIPE_BILLING_ENABLED=false`
2. Redeploy.
3. Verify `/api/health` and auth flow.
4. Open incident with:
   - UTC time
   - affected flow
   - screenshot/log payload

## 9. Post-Launch (within 24h)
1. Monitor Sentry and uptime alerts.
2. Re-run production smoke.
3. Capture launch report and known issues list.
