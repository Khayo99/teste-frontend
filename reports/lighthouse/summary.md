# Lighthouse audit report

Generated: 2026-10-03T17:13:50.390Z

## Median results

| Route | Profile | Performance ≥90 | Accessibility ≥95 | Best Practices ≥95 | SEO ≥90 | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | 84 ✗ | 98 ✓ | 96 ✓ | 92 ✓ | 3675 ms | 0.000 | 8 ms |
| `/` | desktop | 99 ✓ | 99 ✓ | 96 ✓ | 92 ✓ | 773 ms | 0.000 | 0 ms |
| `/nft/emerald-ape-042` | mobile | 82 ✗ | 98 ✓ | 96 ✓ | 92 ✓ | 3874 ms | 0.000 | 3 ms |
| `/nft/emerald-ape-042` | desktop | 77 ✗ | 95 ✓ | 96 ✓ | 92 ✓ | 787 ms | 0.643 | 0 ms |

Overall gate: **FAIL**

## Conditions

- Production build: `npm run build` with `VITE_MOCK_SCENARIO=success`.
- Server: `vite preview --host 127.0.0.1 --port 4173 --strictPort`.
- Samples: 3 clean-browser navigations per route/profile; Lighthouse storage reset is enabled.
- Profiles: Lighthouse built-in mobile and desktop presets, unmodified.
- Assets, fonts, MSW and application features are loaded normally; there is no audit-only application behavior.

## Results below target

- `/` (mobile): Initial server response time was short: Root document took 0 ms; Reduce unused JavaScript: Est savings of 113 KiB.
- `/` (desktop): Reduce unused JavaScript: Est savings of 113 KiB.
- `/nft/emerald-ape-042` (mobile): Initial server response time was short: Root document took 0 ms; Reduce unused JavaScript: Est savings of 117 KiB.
- `/nft/emerald-ape-042` (desktop): Initial server response time was short: Root document took 0 ms; Reduce unused JavaScript: Est savings of 117 KiB.
- Inspect the linked HTML report for the full audit evidence before accepting an exception.

## Environment

- Git SHA: e2983ad6590f991fdcd9e71287102b7b16d01b29
- Platform: darwin (arm64)
- Node: v24.14.1
- npm: 11.11.0
- Vite: vite/8.3.2 darwin-arm64 node-v24.14.1
- Lighthouse: 13.5.0
- Chrome user agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/154.0.0.0 Safari/537.36

## Raw reports

- `home/mobile/run-1.{html,json}`, `home/mobile/run-2.{html,json}`, `home/mobile/run-3.{html,json}`
- `home/desktop/run-1.{html,json}`, `home/desktop/run-2.{html,json}`, `home/desktop/run-3.{html,json}`
- `nft-detail/mobile/run-1.{html,json}`, `nft-detail/mobile/run-2.{html,json}`, `nft-detail/mobile/run-3.{html,json}`
- `nft-detail/desktop/run-1.{html,json}`, `nft-detail/desktop/run-2.{html,json}`, `nft-detail/desktop/run-3.{html,json}`
