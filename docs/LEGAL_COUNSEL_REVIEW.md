# Legal Counsel Review Package — Luna29

Updated: 2026-06-29

This document packages the legal baseline for external counsel review before commercial launch.

## What Changed

Legal substance is no longer English-only. All five public legal documents are fully localized in **11 languages** (`en`, `ru`, `uk`, `es`, `fr`, `de`, `zh`, `ja`, `pt`, `ar`, `he`).

Source of truth in code:

| Document | File | Route | EN title |
|----------|------|-------|----------|
| Legal center | `utils/legal/legalHub.ts` | `/legal` | Legal |
| Privacy Notice | `utils/legal/privacy.ts` | `/privacy` | Privacy Notice |
| Terms of Use | `utils/legal/terms.ts` | `/terms` | Terms of Use |
| Wellness Notice | `utils/legal/medical.ts` | `/disclaimer` | Wellness Notice |
| Cookies Notice | `utils/legal/cookies.ts` | `/cookies` | Cookies and Tracking Notice |
| Your Data | `utils/legal/dataRights.ts` | `/data-rights` | Your Data |
| UI chrome + notices | `utils/legal/ui.ts` | — |

Runtime resolver: `getLegalDoc(lang, doc)` in `utils/legal/index.ts`.

Effective date: **June 29, 2026** (`LEGAL_EFFECTIVE_DATE_BY_LANG`).

## Product Facts Counsel Should Validate

Provide counsel with this factual brief (verify accuracy):

1. **Product type:** Wellness / cycle-awareness companion — **not** a medical device, diagnostic tool, or treatment provider.
2. **Data architecture:** Local-first wellness records on device; optional server features for auth, billing, export, AI insights.
3. **Payments:** Stripe subscriptions (monthly/yearly), 7-day trial configurable via `STRIPE_TRIAL_DAYS`.
4. **AI:** Optional AI features; consent-gated; limited payloads to model providers when enabled.
5. **Analytics / monitoring:** GA4 and Sentry — consent-gated on client.
6. **DSAR:** Self-service export/delete in UI + server API (`/api/privacy/*`). Identity verification workflow is **not yet implemented** (flag for counsel).
7. **Primary market framing:** U.S.-oriented baseline (CCPA/CPRA-style disclosures). International users receive translations for convenience; **English is stated as controlling** unless local law requires otherwise.
8. **Children:** Not directed to under-13; no pediatric clinical use.
9. **Controller / contact:** Confirm legal entity name, postal address, and privacy contact email before launch — **placeholders must be replaced** in counsel-approved final PDF/web version if not yet in code.

## Routes to Review in Staging

| Route | Doc type |
|-------|----------|
| `/legal` | legal (hub) |
| `/privacy` | privacy |
| `/terms` | terms |
| `/disclaimer` | medical (Wellness Notice) |
| `/cookies` | cookies |
| `/data-rights` | data_rights (Your Data) |

Test each route in at least **EN** and one non-EN language (e.g. RU) before sign-off.

## Counsel Deliverables Requested

- [ ] Review EN versions of all 5 documents for U.S. wellness/SaaS compliance.
- [ ] Confirm medical disclaimer scope (FDA/wellness app positioning).
- [ ] Confirm subscription/billing language aligns with Stripe merchant terms.
- [ ] Confirm CCPA/CPRA data-rights language and “do not sell/share” statements.
- [ ] Confirm cookie/analytics disclosure matches actual trackers (GA4, Sentry, session cookies).
- [ ] Advise on GDPR/UK GDPR addenda if EU/UK users are in scope.
- [ ] Advise on translation strategy (English controlling + localized convenience).
- [ ] Provide redlines or approval email suitable for audit trail.

## Internal Pre-Counsel Checklist

- [x] Full i18n legal substance (11 languages)
- [x] Effective date set
- [x] Controlling-language notice in UI
- [x] DSAR self-service actions wired in Data Rights page
- [ ] Legal entity name and contact address finalized in copy
- [ ] Counsel engagement scheduled
- [ ] Counsel sign-off recorded (date + name)
- [ ] Post-counsel redlines merged to `utils/legal/*`

## After Counsel Sign-Off

1. Update `LEGAL_EFFECTIVE_DATE_BY_LANG` if counsel changes effective date.
2. Re-run `npm run audit:i18n` and `npm run ci:check`.
3. Mark legal gate complete in `docs/GO_NO_GO_2WEEK.md`.
4. Deploy to production only after go/no-go meeting (Section 4 of 2-week plan).

## Export for Counsel (optional)

To share plain text, counsel can review files directly in repo or you can run:

```bash
# Example: extract EN privacy sections
node -e "import('./utils/legal/privacy.ts').then(m=>console.log(JSON.stringify(m.LEGAL_PRIVACY.en,null,2)))"
```

For PDF delivery, render staging URLs above or export from browser print-to-PDF per language.

---

**Disclaimer:** In-app text explicitly states templates are not legal advice. This package does not replace licensed counsel.
