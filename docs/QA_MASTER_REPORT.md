# Luna29 QA Master Report — Full System E2E (Stripe disabled)

**Date:** 2026-07-10
**HEAD baseline:** `42efa9b` (`fix: close commercial launch security gaps`)
**Mode:** Local isolated JSON stack + production safe smoke
**Stripe:** disabled · no payments · no product/price/webhook changes

## Executive verdict

**CONDITIONAL PASS** for invited non-paying beta.

Local automated coverage for public site, auth API, security gates, account deletion, labs/bridge (most), and production public smoke is green after fixes. Remaining gaps: some legacy UI E2E flakes (explore/profile/relationships copy), protected readiness not re-proven, Neon backups unconfirmed, paid flows blocked by design.

## Environment

| Target | Classification | Notes |
|--------|----------------|-------|
| `.env.local` DATABASE_URL | **PRODUCTION DATABASE** (Neon) | Not used for destructive E2E |
| Local E2E | Isolated JSON via `scripts/e2e-dev-server.mjs` | `DATABASE_URL=''`, `STRIPE_BILLING_ENABLED=false`, ports 3030/8792 |
| Production | `https://www.luna29.com` | Public + health + auth config only |

## Coverage summary

| Module | Passed | Failed | Blocked |
|--------|-------:|-------:|--------:|
| Public website (local) | 20 | 0 | 0 |
| Auth API | 3 | 0 | 0 |
| Security/premium/IDOR | 6 | 0 | 0 |
| Account deletion | 2 | 0 | 0 |
| Member Today/check-in | 1–2 | ≤1 flake | Live/Voice mic |
| Labs/Bridge (legacy) | 6 | 0 | 0 |
| Profile/Relationships | 0 | 2 | copy/assertion drift |
| Explore knowledge | 0 | 1 | overlay click flake |
| Production public smoke | 19 | 0 | Authenticated prod E2E |
| Unit | 360 | 0 | — |
| Smoke | pass | 0 | — |

## Confirmed defects fixed in this block

1. **Account deletion 500 in local JSON** — `memoryConsentStore` unavailable stub threw on `hardDeleteForUser` during cascade.
   **Fix:** skip unavailable store backends in `deleteAccountLocalJsonCascade`; log cascade errors in orchestrator.
2. **Duplicate sidebar `data-testid`** broke Playwright strict mode.
   **Fix:** `clickSidebarNav()` helper uses `.first()`.
3. **Prod health E2E outdated** — expected verbose topology without secret.
   **Fix:** liveness-only + 401 verbose unauthorized.
4. **E2E risk of hitting production Neon** via `.env.local`.
   **Fix:** isolated `e2e-dev-server.mjs` forces empty `DATABASE_URL`.

## Security findings

- Premium timeline observation detail returns `PREMIUM_REQUIRED` for free users.
- Admin ops denied for normal Bearer users.
- Checkout with billing disabled returns 503 (no live Stripe session).
- Contact XSS payload not reflected raw.
- Google unverified remains false on production auth config.
- No secrets printed; synthetic `@luna.test` emails only.

## Remaining blockers (paid / open beta)

- Stripe live keys/prices/webhook not configured (intentional this block)
- Protected readiness probe not re-run
- Neon backup/PITR operator confirmation
- Legal counsel sign-off
- Bootstrap password rotation
- Full Voice/Live mic automation (mocked/partial)
- Authenticated production disposable-user flows (not authorized against prod DB)

## Validation commands (latest)

- `npx playwright test` (local isolated): **41 passed / 4 failed** (pre-member-today fix); core suites **32/33** then member-today fix pending re-check
- `npx playwright test -c playwright.prod.config.mjs`: **19/19 passed**
- `npm run test:unit`: **360/360**
- `npm run test:smoke`: **pass**
- `npx tsc --noEmit`: **pass**
- `npm run perf:bundle`: **pass**

## Proposed checkpoint (NOT committed)

Message: `test: add isolated e2e harness and fix json deletion cascade`

Files: see git status in final response.
