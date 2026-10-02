# Payment Checkout Data Model

## CheckoutDetails

| Field | Rules |
| --- | --- |
| displayName, username, profileName | Required non-empty collector values |
| network, walletType | Required supported selections |
| walletAddress | Required `0x` address with at least eight hexadecimal characters |
| email | Required valid email address |
| ens | Required ENS name entered without the displayed `.eth` suffix |
| secondaryAddress, referralCode, note | Optional strings |
| useAnotherWallet | Explicit boolean choice |

The defaults derive from the authenticated collector profile and the selected registered wallet. The form is local draft state; no private field is shared to another collector.

## WalletConnection

| Field | Meaning |
| --- | --- |
| walletId | Stable identity of a registered wallet, or selected compatible simulated provider |
| network | Network selected for the quote and order |
| status | `disconnected`, `connecting`, `connected`, or `rejected` |

Only `connected` is valid for payment submission. A disconnect clears the connection status but keeps form input and the quote for review.

## Quote

| Field | Rules |
| --- | --- |
| items | Stable NFT and edition identities with authoritative availability and price ETH strings |
| coupon | Optional applied coupon and decimal-string discount |
| totals | Decimal-string subtotal, discount, network fee, and total |
| fingerprint | Stable derived representation of items, coupon, and totals used to invalidate confirmation acknowledgement |

Quote values are owned by the simulated service. A material quote fingerprint change changes checkout state from `ready` to `review-required`.

## PaymentAttempt

| Field | Rules |
| --- | --- |
| idempotencyKey | UUID generated once per collector and request fingerprint |
| requestFingerprint | Cart lines, coupon, quote fingerprint, wallet, and network; content cannot change for a reused key |
| orderId | Persisted once an order is accepted or later recovered |
| status | `draft`, `submitting`, `pending`, `confirmed`, `declined`, or `recoverable-error` |

Transitions: `draft → submitting → pending|confirmed|declined|recoverable-error`; recovery moves `recoverable-error → pending|confirmed|declined`. A terminal status cannot regress from an event with a lower or duplicate version.

## OrderReceipt

| Field | Rules |
| --- | --- |
| id, userId, version, createdAt | Stable order identity and ordered event metadata |
| status, reason | Terminal/pending state and optional refusal reason |
| receipt | Immutable copy of Quote at acceptance |
| transactionReference | Simulated reference, present for confirmed orders |

An order belongs to exactly one authenticated collector and contains one immutable financial receipt. Confirmed quantities are removed from the cart; rejected/pending quantities remain.
