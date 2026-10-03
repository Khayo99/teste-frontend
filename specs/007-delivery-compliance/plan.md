# Implementation Plan: Delivery Compliance

**Branch**: `007-delivery-compliance` | **Date**: 2026-10-03 | **Spec**: `specs/007-delivery-compliance/spec.md`

## Summary

Harden the existing React/TypeScript marketplace around authoritative MSW REST data, expiring sessions, edition-aware carts, idempotent orders, reconnectable Socket.IO events, and reproducible Chromium/Lighthouse evidence. Preserve the current visual system and document that Figma parity is not certified without file access.

## Technical Context

**Language/Version**: TypeScript 6, React 19, Node 24

**Primary Dependencies**: TanStack Router/Query, Axios, Zustand (UI-only), MSW 2, socket.io-client, Decimal.js, Zod, Playwright, Lighthouse

**Storage**: Browser localStorage for mock database, visitor identity, session, and recovery drafts; no production backend

**Testing**: Typecheck, ESLint, Vite build, Playwright Chromium desktop/mobile, visual snapshots, Lighthouse HTML/JSON

**Target Platform**: Vite SPA, local mock build and provider-neutral static hosting

**Performance Goals**: Lighthouse medians at the challenge thresholds; no layout overflow at 390/768/1440 px

**Constraints**: ETH strings at transport boundaries, no real blockchain/payment, no cross-user data, direct route refresh

**Scale/Scope**: Existing marketplace screens plus compliance remediation across auth, cart, catalog, orders, mocks, UI, tests, and evidence

## Constitution Check

- Figma/brief source of truth: PASS with documented limitation that Figma access is unavailable.
- Required stack real: PASS after REST-backed cart and Chromium/Lighthouse evidence are completed.
- Data integrity: BLOCKED until session, cart isolation, edition stock, decimal math, receipt snapshot, and reconnect recovery are fixed.
- Accessibility/responsive parity: BLOCKED until focus management, field errors, mobile Chromium and 390/768/1440 checks pass.
- Verification: BLOCKED until lint and the complete deterministic E2E suite pass.
- Eliminatory gate: BLOCKED until cross-user isolation and simulated purchase recovery are proven.

## Architecture and interfaces

Cart scope is `visitorId` for guests or `userId` for authenticated sessions. REST handlers own cart, catalog edition stock, quote, and order state. TanStack Query keys include scope and normalized request parameters; Zustand stores only transient UI state. A single Axios 401 pathway clears private cache/listeners and preserves `returnTo` plus checkout draft.

Catalog responses become `{ items, page, pageSize, totalItems, totalPages, facets }`. Cart responses include normalized line IDs, NFT/edition identity, quantity, availability, price strings, coupon, and quote revision. Orders accept `Idempotency-Key`, return status/version and immutable receipt snapshots. Socket events carry `resourceId`, `userId`, `version`, and changed fields; reconnection revalidates active queries.

## Project structure

```text
src/features/{auth,cart,catalog,account,orders}/
src/lib/{api,contracts,query-client,query-keys,realtime}.ts
src/mocks/{handlers,enable,browser}.ts
src/components/ui/{dialog,drawer}.tsx
e2e/{support,auth,marketplace-flows,checkout,resilience,accessibility,visual-regression}.spec.ts
specs/007-delivery-compliance/{research,data-model,contracts,quickstart,tasks}.md
reports/lighthouse/{home,nft-detail}/{mobile,desktop}/run-{1,2,3}.{html,json}
```

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected because |
| --- | --- | --- |
| Keep Zustand alongside Query | UI needs optimistic/transient state while Query owns server state | Removing Zustand would require rewriting existing UI state and does not solve network authority |
| Browser-local mock database | The challenge requires deterministic MSW without a private backend | A remote service would violate checkout reproducibility and clean-checkout execution |
