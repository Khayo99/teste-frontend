# Feature Specification: Payment Checkout

**Feature Branch**: `006-payment-checkout`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "Implement the payment design from the supplied Figma prototype with exact visual fidelity, all README requirements, and project conventions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete a protected NFT purchase (Priority: P1)

An authenticated collector reviews the NFTs in the cart, supplies the required collector and wallet details, selects a registered wallet and network, confirms the quote, and receives a confirmed order receipt.

**Why this priority**: This is the core value of payment: a collector can turn a selected cart into a verified purchase.

**Independent Test**: Starting with an authenticated collector and an eligible cart, complete all required fields and wallet selection, submit once, and verify that the resulting order is confirmed and the purchased quantities leave the cart.

**Acceptance Scenarios**:

1. **Given** an authenticated collector with an eligible cart, **When** they open payment, **Then** they see the Figma-matching collector form, NFT summary, quote totals, wallet choices, and a disabled or actionable confirmation state appropriate to the form.
2. **Given** all mandatory details, a compatible network, and a selected wallet, **When** the collector confirms the purchase, **Then** exactly one simulated order is created and its confirmed receipt shows the original items, fees, discount, total, and transaction reference.
3. **Given** a confirmed order, **When** the collector refreshes or revisits its confirmation, **Then** the same immutable receipt and final order state are restored.

---

### User Story 2 - Resolve changed quotes before payment (Priority: P1)

A collector is protected from paying an outdated price, availability, coupon, or network fee when cart information changes during checkout.

**Why this priority**: A payment cannot be trustworthy unless its quote reflects the current purchasable state.

**Independent Test**: Open payment with a valid cart, cause a price or availability change, and verify that the collector is informed, cannot confirm the old quote, and can explicitly accept a refreshed quote.

**Acceptance Scenarios**:

1. **Given** the collector is reviewing payment, **When** an item price, available edition, coupon, or fee changes, **Then** the summary updates visibly and the previous confirmation is invalidated.
2. **Given** a quote is outdated, **When** the collector tries to confirm it, **Then** no order is created and the interface requires a new explicit review of the refreshed quote.
3. **Given** the cart loses a requested edition while payment is open, **When** the quote refreshes, **Then** the unavailable item and next recovery action are clearly shown while remaining cart items are preserved.

---

### User Story 3 - Recover safely from payment outcomes (Priority: P2)

A collector receives clear status and recovery options when wallet connection is refused or disconnected, the payment is refused, or the request times out after it may have been accepted.

**Why this priority**: Payment status can be uncertain; the collector must never be charged twice or lose their cart while recovering.

**Independent Test**: Exercise simulated wallet refusal, pending order with connection interruption, timeout after submission, and declined payment; verify one recoverable order attempt, an accurate final state, and preservation of unpurchased cart items.

**Acceptance Scenarios**:

1. **Given** the collector selects or connects a wallet, **When** the connection is declined or lost, **Then** the interface announces the state and allows a safe retry or another wallet selection without submitting an order.
2. **Given** submission times out after order creation, **When** the collector refreshes, reconnects, or retries, **Then** the original attempt is recovered rather than a duplicate purchase being created.
3. **Given** a payment is refused, **When** the final state arrives, **Then** no success receipt is shown and the cart retains the unpurchased items and quantities.

### Edge Cases

- A signed-out visitor who opens payment is redirected through sign-in and returns to payment with their cart and intended route preserved.
- Mandatory collector details, address format, network, and wallet type are validated with associated, accessible error messages before submission.
- Repeated confirmation clicks, browser retry, or a second submission while an order is pending never create a second order.
- An empty cart cannot reach a payable confirmation state and directs the collector back to discovery.
- Reloading while an order is pending restores the order state and continues status recovery rather than starting a new payment.
- The page remains usable at 390, 768, and 1440 pixel widths, without unintended horizontal overflow or hidden totals/actions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST protect the payment and confirmation routes, preserve the intended payment context through authentication, and isolate payment, wallet, and order data by collector.
- **FR-002**: The payment screen MUST match the supplied Figma desktop composition and the project visual system, including page hierarchy, collector form, NFT receipt rows, quote summary, wallet/network selection, confirmation control, shared header, and footer; it MUST provide an equivalent usable responsive layout at mobile and tablet widths.
- **FR-003**: The system MUST prefill available collector information and use the collector's registered wallets, while allowing the required payment details shown in the layout to be entered, selected, and validated.
- **FR-004**: The system MUST present an up-to-date quote containing each purchasable cart item, quantities, subtotal, discount, network fee, and total, retaining ETH monetary values as exact decimal strings.
- **FR-005**: The system MUST require an explicit review of a freshly validated quote before creating an order and MUST block confirmation when the cart is empty, form data is invalid, wallet connection is unresolved, or the quote is stale.
- **FR-006**: The system MUST create payment attempts idempotently, show pending, confirmed, and refused states, and only show the order confirmation route for an order confirmed by the simulation.
- **FR-007**: The system MUST recover a pending or ambiguous timed-out order after reload or reconnection without duplicate creation, using the same attempt when its contents are unchanged and reporting a conflict when they differ.
- **FR-008**: The system MUST preserve all cart items on rejected or failed payment and remove only successfully purchased quantities after confirmation.
- **FR-009**: The system MUST react to current item and order updates while payment is open, ignore duplicated or older updates, alert the collector to material quote changes, and revalidate before submission.
- **FR-010**: The system MUST provide loading skeletons that preserve checkout geometry, understandable empty/error/retry states, accessible status feedback, keyboard-operable controls, visible focus, labels, and linked validation messages.
- **FR-011**: The system MUST retain a receipt snapshot whose item prices, quantities, discount, fees, total, and simulated transaction reference do not change after catalog data changes.
- **FR-012**: The system MUST provide deterministic simulated payment scenarios and executable end-to-end coverage for successful confirmation, refusal, duplicate prevention, timeout recovery, validation, stale quote recovery, and real-time change during checkout.

### Key Entities *(include if feature involves data)*

- **Checkout details**: Collector-provided display, identity, contact, network, address, wallet type, optional secondary address, referral, and observation information used for a payment review.
- **Quote**: The time-bound payable snapshot of eligible cart items, quantities, discount, network fee, and exact total.
- **Wallet connection**: The selected registered wallet, supported network, and simulated connection state used to authorize payment.
- **Payment attempt**: The idempotent request identity and lifecycle state for a single checkout submission.
- **Order receipt**: The immutable confirmed or refused payment record, including transaction reference and financial snapshot.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A collector with a valid cart and registered wallet can reach a confirmed payment receipt in under 3 minutes without leaving the purchase flow.
- **SC-002**: 100% of repeated confirmation interactions for the same checkout content resolve to one order attempt and no duplicate purchase.
- **SC-003**: 100% of simulated price, availability, coupon, or fee changes prevent confirmation of the prior quote until the collector reviews a refreshed quote.
- **SC-004**: At 390, 768, and 1440 pixel viewport widths, all payment controls, total, and recovery feedback remain visible, keyboard-reachable, and usable without horizontal page overflow.
- **SC-005**: 100% of confirmed receipts preserve their original items, financial totals, and transaction reference after subsequent catalog updates.

## Assumptions

- The existing authentication, cart, query, HTTP, mock, and real-time foundations will be extended rather than replaced.
- Wallet networks and connection outcomes are simulated; no blockchain provider, browser wallet extension, or payment gateway is used.
- The supplied Figma payment frame is the canonical desktop visual reference; existing project tokens and shared components are reused wherever they accurately express it.
- Existing cart fixtures supply the NFT image assets used by the Figma receipt rows when they are exact local matches; any non-exact asset use will be documented before release.
- A collector may choose a registered wallet or supply the form details necessary to represent the design, but a confirmed order always requires a valid simulated wallet connection and fresh quote.
