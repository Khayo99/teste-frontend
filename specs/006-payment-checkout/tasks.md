# Tasks: Payment Checkout

**Input**: Design documents from `/specs/006-payment-checkout/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/payment-api.md, quickstart.md

**Tests**: Required by the feature specification and project constitution; add deterministic Playwright coverage for each visible payment outcome.

## Phase 1: Setup

- [X] T001 Record payment Figma asset provenance and any accessible-control substitutions in ARCHITECTURE.md
- [X] T002 [P] Add checkout spacing, receipt, skeleton, and responsive utility tokens in src/styles/design-system.css
- [X] T003 [P] Create checkout test scenario helpers and viewport coverage in e2e/checkout.spec.ts

## Phase 2: Foundational

- [ ] T004 Extend shared typed order/checkout contracts, quote fingerprints, and ordered event payload validation in src/lib/contracts.ts
- [ ] T005 Extend private per-user query keys and persisted payment-attempt recovery keys in src/lib/query-keys.ts
- [X] T006 Extend Axios order adapters for checkout submission payloads, idempotency lookup, receipt references, and typed errors in src/features/orders/orders-api.ts
- [ ] T007 Extend MSW payment/order handlers to validate checkout fields, wallet connection, quote conflicts, immutable receipt references, and idempotent recovery in src/mocks/handlers.ts
- [X] T008 Validate the foundational typed transport and mock behavior with npm run typecheck

**Checkpoint**: Checkout can use a fresh quote, collector defaults, registered wallets, and a recoverable simulated order attempt.

## Phase 3: User Story 1 - Complete a protected NFT purchase (Priority: P1) 🎯 MVP

**Goal**: An authenticated collector can complete the Figma-matching payment flow and view an immutable confirmed receipt.

**Independent Test**: Sign in, open `/checkout` with the deterministic cart, complete the required form and wallet selection, acknowledge the quote, submit once, and verify the confirmed receipt and cart change after refresh.

- [X] T009 [P] [US1] Add deterministic successful protected checkout and confirmed receipt regression coverage in e2e/checkout.spec.ts
- [X] T010 [P] [US1] Add field-level Zod validation and accessible checkout input/select/radio helpers in src/features/orders/checkout-page.tsx
- [X] T011 [US1] Build the Figma-faithful responsive collector form, receipt line items using exact local cart assets, quote summary, and wallet controls in src/features/orders/checkout-page.tsx
- [ ] T012 [US1] Integrate profile and registered-wallet defaults through TanStack Query/Axios with skeleton, empty, and retry states in src/features/orders/checkout-page.tsx
- [X] T013 [US1] Implement quote acknowledgement, connected-wallet gating, idempotent confirmation, and removal of only confirmed quantities in src/features/orders/checkout-page.tsx
- [ ] T014 [US1] Add a confirmed-only immutable receipt view and protected direct order route in src/features/orders/checkout-page.tsx and src/router.tsx
- [X] T015 [US1] Run the User Story 1 Playwright scenario in e2e/checkout.spec.ts

## Phase 4: User Story 2 - Resolve changed quotes before payment (Priority: P1)

**Goal**: A collector must explicitly review the current payable quote after live price, stock, coupon, or fee changes.

**Independent Test**: Change an NFT through MSW while checkout is open, verify the accessible change notice and disabled confirmation, then acknowledge the new total and complete the payment.

- [ ] T016 [P] [US2] Add stale quote, unavailable edition, and real-time update coverage through the Socket.IO client in e2e/checkout.spec.ts
- [ ] T017 [US2] Detect material quote fingerprint changes, reset acknowledgement, and show an accessible refresh/review notice in src/features/orders/checkout-page.tsx
- [ ] T018 [US2] Deduplicate ordered `nft.updated` events, synchronize cart quote lines, and invalidate/revalidate quote/order data in src/features/orders/checkout-page.tsx and src/lib/contracts.ts
- [ ] T019 [US2] Prevent stale quote submission and render the quoted availability recovery state in src/features/orders/checkout-page.tsx and src/mocks/handlers.ts
- [ ] T020 [US2] Run the User Story 2 Playwright scenario in e2e/checkout.spec.ts

## Phase 5: User Story 3 - Recover safely from payment outcomes (Priority: P2)

**Goal**: Wallet refusal, disconnect, order refusal, pending state, and ambiguous timeout have truthful recovery without duplicate payment.

**Independent Test**: Run payment-declined, payment-pending, and order-timeout mock scenarios; verify no false receipt, cart preservation on refusal, and same-attempt recovery after reload.

- [ ] T021 [P] [US3] Add wallet refusal/disconnect, declined order, repeated-click, pending reconnection, and timeout-recovery scenarios in e2e/checkout.spec.ts
- [ ] T022 [US3] Implement simulated wallet connection lifecycle and accessible refusal/disconnection feedback in src/features/orders/checkout-page.tsx
- [ ] T023 [US3] Persist per-user idempotency attempts and recover matching orders after refresh/timeout without cross-user leakage in src/features/orders/orders-api.ts and src/features/orders/checkout-page.tsx
- [ ] T024 [US3] Apply version-ordered `order.updated` events, recover pending order state, and render declined/pending states without a success receipt in src/features/orders/checkout-page.tsx
- [ ] T025 [US3] Run the User Story 3 Playwright scenario in e2e/checkout.spec.ts

## Phase 6: Polish and Cross-Cutting Verification

- [ ] T026 [P] Validate checkout at 390px, 768px, and 1440px with keyboard navigation, focus visibility, linked errors, motion-safe skeleton shimmer, and no horizontal overflow in src/features/orders/checkout-page.tsx and e2e/checkout.spec.ts
- [X] T027 [P] Document payment contracts, cache/session policy, mock transport limitation, asset decision, scenarios, and validation commands in README.md and ARCHITECTURE.md
- [ ] T028 Run npm run typecheck, npm run lint, npm run build, npm run test:e2e, and the checkout visual inspection against the Figma frame

## Dependencies & Execution Order

- Setup tasks T001–T003 can start immediately.
- Foundational tasks T004–T008 block all user stories.
- US1 (T009–T015) delivers the minimum purchase path.
- US2 (T016–T020) extends US1's quote path with live invalidation.
- US3 (T021–T025) extends the same order path with safe recovery.
- Polish T026–T028 follows all stories.

## Parallel Opportunities

- T002 and T003 are independent setup work.
- T009, T010, T016, and T021 can prepare tests/helpers while their feature integrations are being built, but their execution follows the foundation.
- T026 and T027 are independent after feature behavior is stable.

## Implementation Strategy

1. Build and validate the typed MSW/Axios contract first.
2. Deliver US1 as a visually faithful complete checkout, including only confirmed receipt access.
3. Add stale quote behavior through real-time events (US2).
4. Add truthful connection and timeout recovery (US3).
5. Finish responsive/a11y/documentation checks and execute the release gates.

## Phase 7: Convergence

- [ ] T029 Implement recovery of the persisted per-user idempotency key through `GET /api/orders` after refresh or timeout per FR-007 (partial)
- [ ] T030 Add a protected direct confirmed-receipt route with immutable order lookup in src/router.tsx and src/features/orders/checkout-page.tsx per FR-006/FR-011 (partial)
- [ ] T031 Add deterministic declined, pending, timeout-recovery, stale-quote, and Socket.IO update E2E scenarios in e2e/checkout.spec.ts per FR-009/FR-012 (partial)
- [ ] T032 Reconcile pending order state through REST after Socket.IO reconnect and preserve terminal version ordering in src/features/orders/checkout-page.tsx per FR-007/FR-009 (partial)
