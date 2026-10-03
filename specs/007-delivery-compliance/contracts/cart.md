# Cart REST Contract

All endpoints use `/api`, JSON, and `X-Cart-Id` for visitor scope or Bearer session for user scope.

- `GET /cart` → `{ cart }`
- `POST /cart/items` body `{ nftId, editionId, quantity }` → `{ cart }`
- `PATCH /cart/items/:lineId` body `{ quantity }` → `{ cart }`
- `DELETE /cart/items/:lineId` → `{ cart }`
- `PUT /cart/coupon` body `{ code }` → `{ cart }`; invalid/expired codes return 422/410
- `DELETE /cart/coupon` → `{ cart }`
- `POST /cart/merge` body `{ visitorId }` → `{ cart, adjustments }`
- `POST /cart/quote` body `{ lines, coupon }` → authoritative decimal-string quote

Errors use `{ message, fieldErrors? }`; 401/403 are never converted to successful empty carts.
