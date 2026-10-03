# Quickstart Validation

```bash
npm ci
cp .env.example .env
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e -- --project=chromium-desktop --project=chromium-mobile --workers=1
npm run lighthouse
```

Use `demo@kurio.test` / `kurio-demo`. Verify visitor cart merge, expired-session reauthentication, stale price event, pending order reconnect, declined payment, timeout idempotency, two-wallet persistence, direct route refresh, and visual snapshots. A successful run must produce `reports/lighthouse/summary.md` and 12 HTML/JSON pairs.
