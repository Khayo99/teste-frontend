# Checkout Validation Quickstart

## Prerequisites

Install the locked project dependencies, then run the local Vite application. Use the documented mock credentials (`demo@kurio.test` / `kurio-demo`) and leave MSW enabled.

## Manual validation

1. Sign in, navigate to `/cart`, and choose checkout. Confirm `/checkout` preserves cart content and shows the collector form, quote rows, wallet controls, and Figma-matching desktop composition.
2. Complete every required field, select a compatible network and connected wallet, review the current quote, then confirm. Verify only one order is created and its confirmed receipt preserves totals and transaction reference after reload.
3. Set `VITE_MOCK_SCENARIO=payment-declined`; confirm that the refusal is announced, no success receipt is shown, and cart items remain.
4. Set `VITE_MOCK_SCENARIO=order-timeout`; submit once, reload, and verify the existing pending/confirmed order is recovered without creating a duplicate.
5. Trigger the mock NFT update control while checkout is open. Verify the quote changes, acknowledgement is cleared, and confirmation requires another review.
6. Repeat at 390px, 768px, and 1440px. Tab through controls and verify focus, labels, errors, live feedback, and the total/action remain available.

## Automated validation

Run `npm run typecheck`, `npm run lint`, `npm run build`, and the targeted Playwright checkout test. Run the project E2E suite and Lighthouse preview audit before release. See [payment-api.md](./contracts/payment-api.md) and [data-model.md](./data-model.md) for expected transport and state outcomes.
