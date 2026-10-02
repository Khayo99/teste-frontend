# Payment API Contract

All requests are sent through the project Axios client and are simulated by MSW. Private endpoints require the active bearer session.

## `POST /api/cart/quote`

**Request**: `items[]` (`id`, `editionId`, integer `quantity`) and optional `coupon`.

**Success**: authoritative cart lines plus `coupon` and decimal-string totals: `subtotalEth`, `discountEth`, `networkFeeEth`, `totalEth`.

**Errors**: `422` for invalid/expired coupon; service/network failures are recoverable and leave cart contents intact.

## `GET /api/profile` and `GET /api/wallets`

**Success**: collector defaults and that collector's registered wallet records. `401` represents expired or missing session.

## `POST /api/orders`

**Headers**: `Idempotency-Key` is required.

**Request**: cart `items[]`, optional `coupon`, reviewed `quote`, `checkout` detail payload, selected wallet identity, network, and wallet connection state.

**Success**: `201` and the order, in `pending`, `confirmed`, or `declined` state. The order contains a receipt snapshot and an optional simulated transaction reference.

**Idempotency**: Repeating the same key with the same request fingerprint returns the original order. Reusing it with changed content returns `409`.

**Validation/conflict errors**: `400` for absent idempotency key or invalid checkout/wallet connection; `401` for unauthenticated session; `409` for stale quote, unavailable edition, or content conflict.

**Timeout scenario**: The mock may create a pending order then produce a transport failure. Recovery uses `GET /api/orders` and the persisted idempotency key to locate the original attempt.

## `GET /api/orders` and `GET /api/orders/:id`

Return only the current collector's orders. A `404` for another collector or missing order must not reveal private receipt data.

## Socket events

`nft.updated` supplies stable NFT id, decimal-string price, availability, and monotonically increasing version. `order.updated` supplies order id, collector id, status, version, optional refusal reason, and final transaction reference. Consumers ignore duplicate or older versions and reconcile active data with REST after reconnect.
