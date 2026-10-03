# Tasks: Delivery Compliance

## Phase 1 — Foundation

- [ ] T001 [P] Complete feature contract and audit traceability in `specs/007-delivery-compliance/`.
- [ ] T002 [P] Add normalized cart, edition stock, order receipt, wallet, and session types in `src/lib/contracts.ts`.
- [x] T003 Fix Playwright fixture reset semantics, Chromium mobile project, and project-specific snapshot paths.
- [x] T004 Fix ESLint errors and warnings without excluding test code.

## Phase 2 — Session and cart (P1)

- [x] T005 Implement shared `requireSession` with expiry/revocation checks in `src/mocks/handlers.ts`.
- [x] T006 Add Axios 401 handling and checkout return/draft recovery in `src/lib/api.ts`, auth store, and router.
- [x] T007 Add visitor/user cart REST handlers and scope persistence in `src/mocks/handlers.ts`.
- [ ] T008 Replace cart authoritative Zustand mutations with Query-backed cart adapters and visitor-to-user merge.
- [ ] T009 Add cart and merge E2E scenarios for two users, refresh, coupon, availability, and rollback.

## Phase 3 — Catalog, wallets, and orders (P1)

- [x] T010 Add server pagination/facets and edition-aware stock to catalog handlers/adapters/UI.
- [x] T011 Implement primary/secondary wallet UI, duplicate-address validation, persistence, and checkout selection.
- [x] T012 Rebuild server quote/order validation with Decimal.js, canonical fingerprint, idempotency, pending deadlines, and immutable receipts.
- [x] T013 Remove checkout fallbacks and recover orders from REST after refresh/reload.
- [ ] T014 Add order outcome, precision, wallet, edition stock, and idempotency E2E scenarios.

## Phase 4 — Realtime, UI, and accessibility (P1/P2)

- [ ] T015 Make Socket.IO connect/identify/reconnect/cleanup deterministic and reconcile active Query resources.
- [ ] T016 Fix stale/duplicate event handling and pending-order confirmation after disconnect/reconnect.
- [ ] T017 Add focus-managed dialog/drawer primitives and field-associated errors; wire card actions and truthful auxiliary states.
- [ ] T018 Add deterministic MSW latency/out-of-order/403/timeout/reset scenarios.
- [ ] T019 Add realtime, accessibility, skeleton, responsive, and route-refresh E2E coverage.

## Phase 5 — Evidence and release

- [ ] T020 Complete desktop/mobile visual baselines for home/detail/cart/checkout.
- [ ] T021 Run three Lighthouse audits per route/profile and commit HTML/JSON/median summary.
- [ ] T022 Update README, architecture, API/scenario docs, and deployment handoff with actual evidence.
- [ ] T023 Run `typecheck`, `lint`, `build`, full E2E, visual regression, Lighthouse, and clean-checkout verification.
- [ ] T024 Run Spec Kit convergence review and record any remaining gaps before user deployment.
