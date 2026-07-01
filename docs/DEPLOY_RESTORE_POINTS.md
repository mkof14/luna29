# Deploy restore points

Use this list to roll back Vercel or local checkout to a known good release.

| Version | UTC | Branch | Notes |
| --- | --- | --- | --- |
| `deploy/2026-07-01-1856-member-unify` | 2026-07-01T22:56:54Z | `restore/june30-break-a934c88` | Member zone unify, Health Reports i18n split, sidebar light/dark contrast |

## Roll back locally

```bash
git fetch origin --tags
git checkout deploy/2026-07-01-1856-member-unify
```

## Roll back on Vercel

1. Open the Vercel project for `mkof14/luna29`.
2. Find deployment for tag `deploy/2026-07-01-1856-member-unify` (or its commit SHA).
3. Use **Promote to Production** on the previous good deployment, or redeploy that git ref.

## App release string

Set `VITE_APP_RELEASE=deploy/2026-07-01-1856-member-unify` in Vercel Production env when pinning this build in monitoring.
