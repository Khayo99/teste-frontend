# Implementation Plan: Payment Checkout

**Branch**: `006-payment-checkout` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

## Summary

Deliver a protected, responsive checkout and immutable order receipt that reproduce the supplied Figma payment frame. Extend the existing React feature boundaries: typed Axios adapters retrieve profile/wallet data and quotes, TanStack Query owns remote checkout state, MSW owns deterministic order scenarios, and Socket.IO updates invalidate or recover live order state. Reuse the local cart artwork and shared Tailwind/shadcn primitives; compose them into responsive checkout-only UI.

## Technical Context

**Language/Version**: TypeScript 6, React 19

**Primary Dependencies**: TanStack Router, TanStack Query, Axios, Zustand, Zod, Decimal.js, Tailwind CSS, shadcn-derived Button/Input/Select, MSW, socket.io-client, Playwright

**Storage**: Browser local storage for mock account/order persistence and persisted visitor cart; in-memory MSW mock state backed by that storage

**Testing**: Playwright E2E with MSW worker scenarios, TypeScript type-check, ESLint, production Vite build

**Target Platform**: Modern desktop, tablet, and mobile browsers at 1440px, 768px, and 390px widths

**Project Type**: Single-page web application

**Performance Goals**: Preserve checkout layout during loading, keep interactive updates responsive, and retain project Lighthouse targets (Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90)

**Constraints**: Exact-decimal ETH transport; no real wallet or gateway; fresh quote required for ordering; duplicate-safe idempotency; receipt snapshot immutable; Figma asset/layout parity; no cross-user private state.

**Scale/Scope**: Payment screen, order confirmation route/state recovery, existing cart/order/mock integration, and targeted Playwright regression coverage.

## Constitution Check

**Pre-design gate: PASS.**

- The Figma payment frame and README are the visual and behavioral sources of truth. The plan reuses project design tokens and actual local receipt artwork; visible Figma-only control assets are represented through existing accessible UI primitives when no project asset exists, with this deviation documented.
- Every required stack responsibility remains effective: routes use TanStack Router, remote data uses Query/Axios, mocks own behavior through MSW, real-time goes through `socket.io-client`, and the visible flow receives Playwright coverage.
- Decimal ETH values are represented as strings and calculated by the mock using Decimal.js. Order creation strengthens quote fingerprinting and receipt persistence without changing this boundary.
- Responsive layout, skeletons, focus, labels, status announcements, and error association are explicit implementation tasks.
- Verification gates are typecheck, lint, build, checkout E2E, targeted visual inspection, and then project-level E2E when feasible.

**Post-design gate: PASS.** The research, model, contracts, and quickstart retain the same source-of-truth, stack, integrity, accessibility, and verification requirements; no exception is requested.

## Project Structure

### Documentation

```text
specs/006-payment-checkout/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/payment-api.md
└── tasks.md
```

### Source Code

```text
src/
├── components/                 # Shared app layout and shadcn-derived primitives
├── features/
│   ├── account/                # Profile and wallet Axios contracts/forms
│   ├── cart/                   # Persisted cart and quote adapter
│   └── orders/                 # Checkout UI, order adapters, confirmation UI
├── lib/                        # Axios client, typed contracts, query keys, real-time client
├── mocks/                      # MSW REST/socket handlers and deterministic state
└── styles/                     # Design tokens

e2e/
└── checkout.spec.ts            # Checkout and payment recovery scenarios
```

**Structure Decision**: Extend the existing single-page feature-first structure. Shared account and cart adapters are reused instead of duplicating their models; checkout-specific controls and recovery behavior stay under `src/features/orders/`.

## Complexity Tracking

No constitutional violations require justification.
