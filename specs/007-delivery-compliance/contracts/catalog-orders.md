# Catalog, Orders, and Events

`GET /nfts` accepts `search`, `category`, `network`, `minPrice`, `maxPrice`, `sort`, `page`, and `pageSize`, and returns pagination metadata plus facets. `POST /orders` requires `Idempotency-Key`; the server recomputes quote/stock and returns an immutable receipt. `GET /orders` and `GET /orders/:id` resolve persisted pending deadlines.

`nft.updated` carries `{ nftId, editionId, priceEth, availability, version }`. `order.updated` carries `{ orderId, userId, status, version, reason?, transactionReference? }`. Clients ignore stale/duplicate versions and revalidate active resources after reconnect.
