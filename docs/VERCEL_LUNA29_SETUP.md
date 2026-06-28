# Vercel Setup — mkof14/luna29

Quick guide for first production deploy from [github.com/mkof14/luna29](https://github.com/mkof14/luna29).

## 1. Import project

1. Open [vercel.com/new](https://vercel.com/new)
2. Import Git repository: **mkof14/luna29**
3. Framework: **Vite** (auto-detected)
4. Build: `npm run build` | Output: `dist`
5. Deploy

Vercel reads `vercel.json` — API routes `/api/*` → `api/index.mjs`.

## 2. Soft launch env (minimum, billing off)

Set in **Project → Settings → Environment Variables → Production**:

```env
# Frontend
VITE_ENABLE_AI=false
VITE_SENTRY_ENV=production
VITE_APP_RELEASE=main

# Auth (required)
SUPER_ADMIN_EMAILS=your-email@example.com
SUPER_ADMIN_BOOTSTRAP_PASSWORD=<strong-unique-password>
AUTH_ALLOWED_ORIGINS=https://<your-vercel-domain>.vercel.app
AUTH_ALLOW_UNVERIFIED_GOOGLE=false

# Billing off for soft launch
STRIPE_BILLING_ENABLED=false
```

Replace `<your-vercel-domain>` with the actual Vercel URL after first deploy, then **redeploy**.

Optional (when ready):
```env
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
AUTH_GOOGLE_CLIENT_IDS=<google-client-id>.apps.googleusercontent.com
GEMINI_API_KEY=<secret>
VITE_SENTRY_DSN=<sentry-dsn>
```

## 3. Full commercial env (when Stripe is ready)

See `docs/VERCEL_STRIPE_PRODUCTION_CHECKLIST.md` and set:

```env
STRIPE_BILLING_ENABLED=true
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY_ID=price_...
STRIPE_PRICE_YEARLY_ID=price_...
STRIPE_SUCCESS_URL=https://<domain>/member?billing=success
STRIPE_CANCEL_URL=https://<domain>/pricing?billing=canceled
STRIPE_PORTAL_RETURN_URL=https://<domain>/profile
STRIPE_TRIAL_DAYS=7
```

Stripe webhook URL: `https://<domain>/api/billing/webhook`

## 4. After deploy — smoke test

```bash
SMOKE_BASE_URL=https://<your-vercel-domain>.vercel.app npm run smoke:deploy
curl -s "https://<your-vercel-domain>.vercel.app/api/health?verbose=1" | head
```

Expected: smoke PASS, health `ok: true`.

## 5. GitHub Actions secrets (optional monitoring)

Repository → Settings → Secrets:

- `UPTIME_BASE_URL` = production URL
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` (optional alerts)

## 6. Custom domain (later)

Vercel → Domains → add domain → update `AUTH_ALLOWED_ORIGINS` → redeploy.

## 7. Rollback

- Quick: redeploy previous Vercel deployment from Deployments tab
- Billing off: `STRIPE_BILLING_ENABLED=false` → redeploy
