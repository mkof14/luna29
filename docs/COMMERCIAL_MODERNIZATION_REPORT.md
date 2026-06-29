# Отчёт о коммерческой модернизации Luna29

**Дата:** 29 июня 2026  
**Репозиторий:** `/Users/mk/Desktop/Luna29`  
**Статус:** готово к production-деploy при настройке env-переменных

---

## 1. Резюме

Выполнена полная коммерческая модернизация веб-приложения Luna29: безопасность API, согласие на AI-обработку, серверный trial через Stripe/billing API, аналитика конверсий, шифрование чувствительных localStorage-ключей, SEO/маршрутизация, unit-тесты и документация окружения.

---

## 2. Архитектура

### 2.1 Backend (два entry point — синхронизированы)

| Файл | Назначение |
|------|------------|
| `api/index.mjs` | Vercel serverless handler |
| `server/index.mjs` | Локальный HTTP API (`AUTH_API_PORT=8787`) |

Оба используют общие модули:

| Модуль | Назначение |
|--------|------------|
| `server/core/securityHeaders.mjs` | CSP, HSTS, Permissions-Policy |
| `server/core/httpUtils.mjs` | `readBodyWithLimit`, `hasAiProcessingConsent` |
| `server/core/authRoles.mjs` | Роли без auto-admin по email-паттернам |
| `server/core/rateLimit.mjs` | Upstash Redis или in-memory fallback |
| `server/core/database.mjs` | Опциональный Postgres (`DATABASE_URL`) |
| `server/core/billingTrial.mjs` | Общая логика создания trial-записи |

**Проверка синхронизации:** diff `api/index.mjs` vs `server/index.mjs` показывает только обёртку (Vercel handler vs `http.createServer`) и пути импортов — бизнес-логика идентична.

### 2.2 Frontend

- React 19 + Vite 6 + TypeScript strict
- 4-tab mobile nav: Today / Speak / Story / You (`utils/navigation.ts`)
- Lazy-loaded тяжёлые view (Dashboard, Admin, LiveAssistant, Auth, PublicLanding)
- Service Worker только в production (`index.tsx`)

### 2.3 Поток trial

1. Публичная страница → «Start trial» → `markTrialPending()` + signup
2. После auth → `billingService.startServerTrial()` → `/api/billing/trial/start`
3. Локальный кэш → `applyServerTrialToLocal()` + `conversionEvents.trialStarted()`

---

## 3. Безопасность (P0)

| Изменение | Детали |
|-----------|--------|
| AI routes auth | `requireSessionAndAi` на voice/respond, extract, admin AI |
| Consent header | Клиент: `X-Luna-AI-Consent: 1` через `utils/aiConsent.ts` |
| Consent UI | `components/AiConsentGate.tsx` в VoiceCapturePanel, LiveAssistant, PublicVoiceTeaser |
| Body limits | `readBodyWithLimit` на POST |
| Auto-admin удалён | `ADMIN_EMAIL_RULES = []`, `authRoles.mjs` — только explicit super_admin emails |
| Rate limit | Upstash или memory (`server/core/rateLimit.mjs`) |
| Microphone policy | `vercel.json` Permissions-Policy |

---

## 4. Приватность и данные

- `utils/privacyCompliance.ts` — `ai_processing` по умолчанию **false**
- `services/secureHealthStorage.ts` — AES-GCM для `luna_event_log_v3`, voice clips, labs draft
- `services/dataService.ts` — интеграция `secureGetItem`/`secureSetItem`, `hydrateLog()` при старте App

---

## 5. Продукт и SEO (P2)

| Элемент | Реализация |
|---------|------------|
| URL `?lang=` | `useAppPreferences` + `utils/urlRouting.ts` |
| URL `?tab=` | `App.tsx` navigateTo + readTabFromUrl |
| hreflang | `index.html` + `updateHreflangLinks()` |
| Sitemap | `/faq`, `/learning` в `scripts/generate-seo-assets.mjs` |
| OG tags | Динамически в `PublicLandingView` per page |
| Voice teaser | `PublicVoiceTeaser` — 3 turn без auth на landing |
| Pattern cards | `PatternInsightCards` на DashboardView |
| Cycle voice | Phase-aware prompts в `server/voiceConversation.mjs` |
| recharts | Удалён (не использовался) |

---

## 6. Аналитика конверсий

`utils/conversionEvents.ts` подключён в:

- `AuthView` — sign up/in started & completed
- `OnboardingGate` — first voice, onboarding completed
- `CheckinOverlay` — checkin voice/sliders
- `BridgeView` — bridge completed
- `DashboardView` — checkout, paywall
- `App.tsx` — trial after signup
- `PublicVoiceTeaser` — anonymous_voice_teaser

---

## 7. Переменные окружения

См. `.env.example`. Ключевые:

```bash
# Frontend
VITE_SITE_URL=https://luna29.vercel.app
VITE_GOOGLE_CLIENT_ID=
VITE_SENTRY_DSN=
VITE_GA4_MEASUREMENT_ID=

# Backend auth
SUPER_ADMIN_EMAILS=dnainform@gmail.com
SUPER_ADMIN_BOOTSTRAP_PASSWORD=
AUTH_GOOGLE_CLIENT_IDS=
AUTH_ALLOWED_ORIGINS=

# AI (server only)
GEMINI_API_KEY=
ELEVENLABS_API_KEY=

# Database (optional)
DATABASE_URL=postgresql://...

# Rate limit (optional, production)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Stripe
STRIPE_BILLING_ENABLED=true
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY_ID=
STRIPE_PRICE_YEARLY_ID=
STRIPE_TRIAL_DAYS=7
```

---

## 8. Deployment checklist

- [ ] Задать все production env в Vercel (см. `.env.example`)
- [ ] `AUTH_ALLOWED_ORIGINS` включает production domain
- [ ] `SUPER_ADMIN_BOOTSTRAP_PASSWORD` — сильный пароль, не в git
- [ ] `DATABASE_URL` для persistent storage (рекомендуется)
- [ ] Upstash для rate limits (рекомендуется)
- [ ] Stripe webhook endpoint + `STRIPE_WEBHOOK_SECRET`
- [ ] `VITE_SITE_URL` = canonical domain
- [ ] Google OAuth: Authorized JavaScript origins = production URL
- [ ] `npm run ci:check` проходит локально
- [ ] E2E: `npm run test:e2e` с `dev:full`

---

## 9. Тестирование

| Команда | Назначение |
|---------|------------|
| `npm run test:unit` | Vitest: aiConsent, subscriptionAccess, authRoles |
| `npm run test:smoke` | Smoke tests |
| `npm run build` | tsc + vite build + SEO assets |
| `npm run test:e2e` | Playwright (webServer: `dev:full`) |

---

## 10. Изменённые и добавленные файлы

### Новые
- `components/AiConsentGate.tsx`
- `components/PatternInsightCards.tsx`
- `components/PublicVoiceTeaser.tsx`
- `utils/urlRouting.ts`
- `server/core/billingTrial.mjs`
- `vitest.config.ts`
- `tests/unit/aiConsent.test.ts`
- `tests/unit/subscriptionAccess.test.ts`
- `tests/unit/authRoles.test.mjs`
- `docs/COMMERCIAL_MODERNIZATION_REPORT.md`

### Обновлённые (основные)
- `App.tsx` — URL tab sync, trial после signup, hydrateLog
- `api/index.mjs`, `server/index.mjs` — billingTrial import
- `services/dataService.ts` — secure storage
- `hooks/useAppPreferences.ts`, `hooks/useSubscriptionAccess.ts`
- `utils/subscriptionAccess.ts` — server trial helpers
- `components/PublicLandingView.tsx` — server trial flow, OG, voice teaser
- `components/VoiceCapturePanel.tsx`, `LiveAssistant.tsx` — AI consent
- `components/AuthView.tsx`, `OnboardingGate.tsx`, `CheckinOverlay.tsx`, `BridgeView.tsx`
- `components/DashboardView.tsx` — PatternInsightCards, conversion events
- `server/voiceConversation.mjs` — cycle-aware prompts
- `package.json` — pg, vitest, jsdom; удалён recharts
- `.env.example`, `playwright.config.mjs`, `scripts/generate-seo-assets.mjs`
- `vite.config.ts` — удалён recharts chunk

---

## 11. Оставшиеся риски

| Риск | Митигация |
|------|-----------|
| JSON file storage на Vercel `/tmp` | Использовать `DATABASE_URL` + Postgres |
| In-memory rate limit на serverless | Upstash Redis |
| Anonymous voice teaser — local fallback без Gemini | Ожидаемо для preview; полный AI после signup + consent |
| Encrypted health data требует passphrase | UI unlock — future enhancement |
| Mobile app (`mobile/`) — отдельный auth mock | Не входит в этот sprint |

---

## 12. Команды для локальной проверки

```bash
npm install
npm run dev:full          # API :8787 + Vite :3000
npm run test:unit
npm run build
```

---

## 13. Доведение до 10/10 (финальный polish)

| Пункт | Статус |
|-------|--------|
| Единый API handler | `server/core/apiHandler.mjs` — единственный источник бизнес-логики; `api/index.mjs` и `server/index.mjs` — thin wrappers |
| Prerender | `scripts/prerender-public.mjs` — 14 публичных маршрутов → `dist/prerender/` после build |
| font-display | `index.html` — `display=swap` в Google Fonts + `@font-face` fallback |
| E2E real API | Удалён fake port `65535`; Playwright использует Vite proxy → `:8787` через `dev:full` |
| Encrypted storage UI | `HealthStorageUnlockPanel` в Privacy Controls (passphrase + migrate) |
| Mobile voice hooks | `hooks/useMobileVoiceCapabilities.ts` (web) + `mobile/src/hooks/...` (RN) |
| API parity check | `scripts/check-api-parity.mjs` в `ci:check` |
| Unit tests | 9 tests: aiConsent, subscriptionAccess, authRoles, urlRouting |

### Команды

```bash
npm run ci:check       # lint + unit + api-parity + smoke + build + prerender + perf
npm run test:e2e       # Playwright с dev:full
node scripts/check-api-parity.mjs
```

---

*Отчёт обновлён: финальный polish sprint — 10/10.*
