# Feature Specification: Delivery Compliance

**Feature Branch**: `007-delivery-compliance`

**Created**: 2026-10-03

**Status**: Draft

**Input**: Correct all delivery gaps identified by the NFT Marketplace audit while preserving the current layout.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Secure authenticated purchase (Priority: P1)

An authenticated collector can maintain an isolated session, review a server quote, submit one idempotent purchase, and recover a pending order after refresh or reconnect.

**Why this priority**: Purchase integrity and user isolation are eliminatory requirements.

**Independent Test**: Expire a session, reauthenticate from checkout, confirm a purchase, disconnect Socket.IO, resolve the order, reconnect, and verify one immutable receipt.

**Acceptance Scenarios**:

1. **Given** an expired token, **When** a private API is called, **Then** it returns 401 and the app preserves the current route and draft.
2. **Given** a valid cart and quote, **When** confirmation is repeated or times out, **Then** one idempotent order is recovered and the receipt is shown only after confirmation.

---

### User Story 2 - Server-backed catalog and cart (Priority: P1)

A visitor can search and paginate through server results, add items to a visitor cart, authenticate, and merge that cart into the user cart with edition-aware stock limits.

**Why this priority**: The required REST contracts and cross-user isolation depend on an authoritative cart.

**Independent Test**: Change filters/page in the URL, refresh, add the same edition as a visitor, sign in, and verify summed quantities are clamped by edition stock.

**Acceptance Scenarios**:

1. **Given** visitor and authenticated carts, **When** login merges them, **Then** lines are combined by NFT/edition and no data crosses users.

---

### User Story 3 - Resilient accessible experience (Priority: P2)

A collector can operate dialogs, drawers, forms, and checkout by keyboard, while deterministic mock failures and real-time changes provide truthful feedback and recovery.

**Why this priority**: Accessibility and reproducible evidence are release gates.

**Independent Test**: Run Chromium desktop/mobile E2E scenarios for errors, skeletons, focus, stale events, reconnection, and responsive overflow.

**Acceptance Scenarios**:

1. **Given** a stale or duplicate event, **When** it reaches the client, **Then** the newer state remains and REST reconciliation occurs after reconnect.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Expired sessions return 401 on every private resource and preserve checkout context.
- Pending orders resolve after reload from persisted state, without timers or duplicate orders.
- Visitor cart merge clamps each edition independently and re-quotes before checkout.
- Price, availability, coupon, fee, wallet, and network changes invalidate quote acknowledgement.
- Invalid, expired, offline, 403, 4xx, 5xx, timeout, stale, and duplicate event scenarios are deterministic.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Every private request MUST validate a non-expired session and user ownership.
- **FR-002**: The cart MUST expose REST CRUD for visitor and authenticated scopes and merge on login.
- **FR-003**: Catalog REST MUST apply filters, sort, page, page size, edition availability, and return pagination metadata.
- **FR-004**: ETH transport values MUST remain decimal strings and use precision-safe arithmetic.
- **FR-005**: Order creation MUST rebuild quote data, validate availability, accept an idempotency key, and store an immutable receipt snapshot.
- **FR-006**: Pending orders MUST be recoverable from persisted state after refresh and Socket.IO reconnection.
- **FR-007**: Wallets MUST support exactly primary and secondary persisted positions with distinct addresses.
- **FR-008**: Socket events MUST carry stable identity/version, reject stale duplicates, and reconcile REST resources after reconnect.
- **FR-009**: MSW MUST provide deterministic success, empty, latency, out-of-order, offline, 401/403/4xx/5xx, coupon, stock, timeout, pending, declined, and reset scenarios.
- **FR-010**: Dialogs, drawers, forms, skeletons, actions, and feedback MUST meet keyboard, focus, label, error, reduced-motion, and responsive requirements.
- **FR-011**: Playwright MUST run Chromium desktop/mobile scenarios and visual snapshots for home, detail, cart, and checkout.
- **FR-012**: Lighthouse MUST produce three mobile and desktop runs for home/detail with medians and Core Web Vitals.

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **Session**: user identity, opaque token, expiry, revocation, and return context.
- **Cart**: visitor/user scope, line items keyed by NFT and edition, coupon, and quote revision.
- **EditionStock**: NFT/edition identity, decimal price string, integer availability, and monotonic version.
- **Order**: user, idempotency key/fingerprint, status/version, pending resolution, and immutable receipt.
- **Wallet**: primary/secondary position, address, network, type, and collector metadata.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: All private API calls with expired tokens return 401 and do not expose another user's data.
- **SC-002**: Repeated checkout submission and timeout recovery create exactly one order per idempotency key.
- **SC-003**: The complete Playwright suite passes in Chromium desktop and mobile with no lint/type/build errors.
- **SC-004**: Three Lighthouse runs per route/profile are available with median scores and LCP/CLS/TBT recorded.
- **SC-005**: Cart, order, profile, and wallet state survives refresh and remains isolated across two fixture users.

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- The current layout and local assets remain the visual baseline; Figma access is unavailable during this implementation.
- The user performs the final public deployment; the repository provides provider-neutral Vite SPA guidance.
- Each user has at most one primary and one secondary wallet with distinct addresses.
- Visitor cart quantities are summed with authenticated quantities and clamped per edition.
- Blockchain, wallet extensions, and payment gateways remain simulated.
