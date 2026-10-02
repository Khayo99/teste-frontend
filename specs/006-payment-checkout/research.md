# Research: Payment Checkout

## Decision: Extend the existing checkout route instead of adding parallel flows

**Rationale**: `/checkout` is already protected and wired to the persisted cart, quote endpoint, and order endpoint. Replacing its minimal UI preserves direct navigation and the existing session return path while filling in the required visual and functional behavior.

**Alternatives considered**: A new `/payment` route or a standalone payment store would duplicate the route guard and fragment cart recovery.

## Decision: Treat a quote fingerprint as the confirmation acknowledgement

**Rationale**: The quote response already contains authoritative values. Deriving a stable fingerprint from its cart lines, coupon, and totals lets the UI disable confirmation until the collector has reviewed that exact response; any refetch change clears the acknowledgement.

**Alternatives considered**: Relying only on query freshness cannot distinguish a background refetch with materially changed payable values from a harmless re-render.

## Decision: Keep idempotency state in persistent browser storage per collector

**Rationale**: An ambiguous timeout must recover after refresh. The generated key and immutable request fingerprint need to survive component remounts, but must never leak between collectors.

**Alternatives considered**: Component state loses the key on refresh; a global unscoped key risks cross-user recovery.

## Decision: Use the existing MSW REST and socket binding as the only simulation authority

**Rationale**: The project already routes HTTP through Axios and events through `socket.io-client` to MSW. The handlers can validate wallet and quote payloads, create/update orders, persist receipts, and emit ordered events without UI shortcuts.

**Alternatives considered**: Directly updating query cache from controls would violate the mandatory mock and Socket.IO path.

## Decision: Compose Figma fidelity from shared tokens and existing cart images

**Rationale**: The existing `emerald-ape`, `violet-nomad`, and `ivory-baron` local assets correspond to the three Figma receipt images. Existing typography and color tokens match the Figma variables. Native radio/select controls styled through shared primitives provide accessible behavior when a matching local icon asset is absent.

**Alternatives considered**: Referencing temporary Figma asset URLs would break local execution; recreating exact images or using remote images would violate asset provenance.

## Decision: Separate pending-order recovery from receipt rendering

**Rationale**: The checkout needs to remain present while an order is pending and recover it by known idempotency key; the confirmation page must only render a confirmed receipt. Keeping the behavior in the order adapter and a confirmation component makes terminal-state access direct and safe.

**Alternatives considered**: Showing the receipt unconditionally after submit would violate the confirmed-only requirement.
