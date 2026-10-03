# Data Model

## Session

`id`, `userId`, `token`, `expiresAt`, `revokedAt?`. Private requests require a non-revoked session whose expiration is after mock time.

## Cart and CartLine

Cart scope is `visitorId` or `userId`. A line is keyed by `lineId`, `nftId`, and `editionId`; it stores integer `quantity`, integer `availability`, decimal-string `priceEth`, and edition label. Coupon and quote revision belong to the cart.

## EditionStock

`nftId`, `editionId`, `priceEth`, `availability`, `version`. Availability and version are independent per edition.

## Wallet

`id` (`primary` or `secondary`), `address`, `network`, `type`, `displayName`, `alias`, profile metadata. A user has at most one record for each position and addresses must be distinct.

## Order and ReceiptSnapshot

Order stores `id`, `userId`, `idempotencyKey`, canonical `fingerprint`, `status`, `version`, `createdAt`, `resolveAt?`, and immutable receipt. Receipt stores normalized lines, edition, price, quantity, coupon, discount, network fee, total, wallet/network, and transaction reference when confirmed.

## State transitions

`pending → confirmed|declined`; terminal orders never regress. A repeated idempotency key with the same fingerprint returns the existing order; a different fingerprint returns 409.
