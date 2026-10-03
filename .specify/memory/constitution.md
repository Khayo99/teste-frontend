<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: none
- Added principles: VI. Eliminatory Compliance Gate
- Added sections: none
- Removed sections: none
- Follow-up TODOs: none
-->
# Jungle NFT Marketplace Constitution

## Core Principles

### I. Figma and Brief Are the Source of Truth
Every implemented screen, responsive state, asset, typography, color, spacing, and interaction
MUST follow the supplied Figma file and README brief. The Figma layout governs visual composition;
the README governs functional behavior. The team MUST NOT add unrequested product ideas, flows, or
visual treatments. Any unavoidable divergence MUST be documented in `docs/architecture/overview.md` before it is
accepted.

### II. Required Stack Must Be Real, Not Decorative
React and TypeScript MUST be used throughout the interface. TanStack Router, TanStack Query, Axios,
Tailwind CSS, shadcn/ui, MSW, Socket.IO client, Playwright, and Lighthouse MUST each participate in
their assigned responsibility. Components MUST use typed REST contracts through Axios; mocked
responses and business rules MUST stay in the MSW network layer rather than UI shortcuts.

### III. Functional Fidelity and Data Integrity Are Non-Negotiable
Every scoped flow MUST work under success, validation, empty, loading, delayed, failure, refresh,
and recovery states described in the brief. ETH values MUST remain decimal strings at transport
boundaries and use precision-safe arithmetic. Authentication, cart, favorite, wallet, order, and
real-time data MUST remain isolated by user and persist or recover exactly as specified.

### IV. Visual, Responsive, and Accessible Parity
The product MUST visually match the available desktop and mobile Figma frames and remain usable at
390, 768, and 1440 pixel widths. All data-dependent views MUST preserve layout with reduced-motion
aware shimmer skeletons. Keyboard operation, visible focus, semantic controls, associated form
errors, dialog focus management, meaningful alternative text, and non-color-only feedback are
release requirements.

### V. Verification Is Part of Each Feature
Each feature MUST include deterministic MSW scenarios and Playwright coverage for its visible user
outcomes, including failure and recovery when the brief requires them. Real-time tests MUST travel
through `socket.io-client`; REST tests MUST travel through MSW handlers. Changes MUST pass
type-checking, linting, build, relevant E2E tests, and visual regression checks before completion.

### VI. Eliminatory Compliance Gate (HIGHEST PRIORITY)
The project MUST follow this constitution and the mandatory stack with the highest priority. The
following failures are eliminatory and MUST block acceptance regardless of visual quality or partial
feature completion: absence of effective use of the mandatory stack, main flows that are merely
visual, a purchase confirmed without a response from the simulation, exposure of data between users,
events simulated directly in the UI, or absence of executable E2E tests.

## Non-Negotiable Product Constraints

Blockchain providers, browser wallet extensions, and payment gateways are simulated only. A confirmed
purchase MUST result from the simulated API and preserve an immutable receipt snapshot. Order creation
MUST be idempotent; an ambiguous timeout MUST recover the original order instead of creating a second
purchase. Socket events MUST carry stable identity and versioning, ignore duplicates or stale events,
and reconcile active resources with REST after reconnecting. External and out-of-scope actions MUST
not appear to have succeeded.

Static Figma assets MUST be used in their intended positions after being saved locally. Assets may not
be redrawn, substituted, or altered unless an exact project asset is already available; any permitted
substitution MUST be documented. The deployed application MUST retain mock-driven behavior and direct
route access after refresh.

## Delivery Workflow and Quality Gates

Work MUST follow Spec Kit artifacts in order: constitution, feature specification, clarification where
needed, implementation plan, tasks, consistency analysis, implementation, and convergence review. A
specification MUST describe observable requirements and acceptance scenarios before feature code is
written. Plans MUST record REST contracts, cache and session policies, MSW scenarios, Socket.IO event
handling, asset provenance, and responsive behavior relevant to the feature.

Before delivery, the repository MUST provide reproducible commands for development, build, preview,
type-checking, linting, Playwright, and Lighthouse. `README.md` MUST document setup, environment,
fictitious credentials, scenarios, reset, contracts, events, cache, session, and cart behavior.
`docs/architecture/overview.md` MUST document design decisions, transport limitations, UX decisions, and Figma
deviations. Lighthouse audits MUST run against optimized builds and report the required medians.

## Governance

This constitution supersedes informal implementation preferences. Every specification, plan, task,
review, and release check MUST verify compliance with these principles. Amendments require a written
rationale, an updated Sync Impact Report, and a semantic version bump: MAJOR for incompatible
governance changes, MINOR for a new or materially expanded requirement, and PATCH for clarification.
Compliance exceptions require explicit user approval and documentation in `docs/architecture/overview.md`.

**Version**: 1.1.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-02
