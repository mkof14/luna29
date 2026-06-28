# Luna Mobile Release Checklist (Android + iOS)

Updated: 2026-03-15

## 1) Local quality gate

Run in `mobile/`:

```bash
npm run -s typecheck
npx expo export --platform android
npx expo export --platform ios
```

Expected: all commands pass.

## 2) Android build + submit

```bash
npm run build:android
npm run submit:android
```

Requirements:
- Google Play Console app created (`com.mkof14.lunamobile`)
- Service account JSON file present locally
- Play Console permissions granted to service account

## 3) iOS build readiness

```bash
npm run build:ios
```

Requirements:
- Paid Apple Developer Program team
- Correct Apple ID with team access
- Bundle identifier configured (`com.mkof14.lunamobile`)

## 4) Production env

Required `.env.production` keys:
- `EXPO_PUBLIC_APP_ENV=production`
- `EXPO_PUBLIC_API_BASE_URL=https://...`

## 5) Backend endpoints to be live

- Auth:
  - `POST /api/mobile/auth/signin`
  - `POST /api/mobile/auth/signup`
  - `POST /api/mobile/auth/logout`
  - `GET /api/mobile/auth/session`
- Today/Story/Reflection:
  - `GET /api/mobile/today`
  - `GET /api/mobile/story`
  - `GET /api/mobile/reflection-result`
  - `POST /api/mobile/reflection`
- Reports:
  - `POST /api/mobile/reports/generate`
  - `POST /api/mobile/reports/save`
  - `GET /api/mobile/reports/history`
  - `POST /api/mobile/reports/:id/pdf`
  - `POST /api/mobile/reports/ocr-intake`
- Admin:
  - `GET /api/admin/state`
  - `GET /api/admin/metrics`
  - `GET /api/admin/audit`
  - `POST /api/admin/metrics/check`
  - `POST /api/admin/social/connect-all`
  - `POST /api/admin/social/pending-review`
  - `GET /api/admin/social/analytics`
  - `POST /api/admin/templates/preview`
  - `POST /api/admin/invites/admin`

## 6) Store listing assets

- App icon (1024x1024)
- Splash screen
- Android screenshots
- iOS screenshots
- Privacy policy URL
- Terms URL
- Support URL/email

## 7) Website store section (after approvals)

Add final links on web:
- Download on the App Store
- Get it on Google Play

Recommended placements:
- Public Home hero
- Footer
- Dedicated Download section
