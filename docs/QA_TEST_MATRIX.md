# Luna29 QA Test Matrix — Non-Stripe E2E

Legend: **P**=PASS **F**=FAIL **B**=BLOCKED **N**=not automated this run

| ID | Module | Precondition | Steps (summary) | Expected | Actual | Result | Severity |
|----|--------|--------------|-----------------|----------|--------|--------|----------|
| PUB-01 | Public | none | Open `/` and sitemap routes | 200, title Luna, no pageerror | OK local+prod | P | — |
| PUB-02 | Public | none | Mobile 375 viewport `/` | No horizontal overflow | OK | P | — |
| PUB-03 | Health | none | `GET /api/health` | alive, no topology | OK | P | — |
| PUB-04 | Health | none | verbose without secret | 401 prod / readiness local | OK prod | P | — |
| AUTH-01 | Auth | isolated API | signup/signin/logout/dup/weak | 200/401/409/400 | OK | P | — |
| AUTH-02 | Auth | isolated API | mobile Bearer token | session OK; bad token no user | OK | P | — |
| AUTH-03 | Auth | UI localStorage seed | member surface visible | OK | P | — |
| SEC-01 | Security | two users | B cannot see A observation text | no leak | P | — |
| SEC-02 | Security | free user | timeline observation detail | 403 PREMIUM_REQUIRED | OK | P | — |
| SEC-03 | Security | normal user | `/api/admin/ops` | 401/403 | OK | P | — |
| SEC-04 | Security | billing off | checkout-session | 503/4xx, no sk_ | OK | P | — |
| SEC-05 | Security | public | contact XSS payload | no raw script echo | OK | P | — |
| DEL-01 | Deletion | disposable user | delete account | 200 deleted; login blocked | OK after fix | P | High fix |
| DEL-02 | Deletion | two users | delete A, B remains | B session OK | OK | P | — |
| TODAY-01 | Today | seeded member | open Quick check-in, save | CTA+save works | fixed locator | P* | — |
| TODAY-02 | Today | mobile viewport | Today usable | no overflow | OK | P | — |
| LAB-01 | Labs | seeded member | analysis/draft/clear/conflict | local mode OK | OK | P | — |
| BR-01 | Bridge | seeded member | reflection note | renders | OK | P | — |
| PROF-01 | Profile | seeded member | update + history | status text | not found | F | Low |
| REL-01 | Relationships | seeded member | meds CRUD status | status text | not found | F | Low |
| EXP-01 | Explore | seeded member | hormone back click | navigates | timeout/overlay | F | Low |
| LIVE-01 | Live | mic | full Live turns | degrade paths | not automated | B | — |
| VOICE-01 | Voice | mic | STT/TTS | no transcript logs | partial/unit | B | — |
| MEM-01 | Memory | consent file | enable/disable/review | server gates | unit+partial | B | — |
| CAL-01 | Calendar | auth | PUT/CORS | PUT allowed | OK CORS | P | — |
| ADM-01 | Admin | normal user | admin denied | 401/403 | OK | P | — |
| PAY-01 | Billing | stripe off | no charge | 503 | OK | P | — |
| PROD-01 | Prod smoke | www.luna29.com | public+health+config | all green | 19/19 | P | — |

\* Re-run member-today after locator fix in same working tree.

## Notes

- Destructive flows never used production Neon (`.env.local` classified PRODUCTION).
- Synthetic emails only (`*@luna.test`).
- Stripe remained disabled throughout.
