# Implementation Plan: Marketplace Footer

**Branch**: `002-marketplace-footer` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

## Summary

Add the Figma footer as the final home-page section. It contains a four-part desktop layout: feature assurances and newsletter signup, brand/contact band, navigational link groups, and a copyright line. The implementation uses the project’s React, TypeScript and Tailwind token conventions; SVG assets supplied by Figma are saved locally and rendered only in their social-icon slots.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 6, React 19

**Primary Dependencies**: Tailwind CSS 4, TanStack Router, Lucide React, React state

**Storage**: N/A; newsletter confirmation is session-local UI state

**Testing**: TypeScript build, ESLint, Playwright

**Target Platform**: Modern desktop and mobile browsers

**Project Type**: Vite single-page web application

**Performance Goals**: Footer is usable at 390 px, 768 px and 1440 px; local icon assets do not block initial interaction.

**Constraints**: Match Figma node 70492:696; use the five exported social SVGs in their supplied slots; preserve visible focus and responsive reflow; do not introduce external services.

**Scale/Scope**: One home-page footer component, five local SVG assets, one Playwright scenario.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| Figma and brief are source of truth | PASS | Figma node 70492:696 supplies layout, text, sizing and social assets. |
| Required stack is real | PASS | Existing React/TypeScript/Tailwind and Playwright are reused. No new dependencies. |
| Functional fidelity and data integrity | PASS | Newsletter state remains local because no transport is in scope; invalid input is rejected visibly. |
| Visual, responsive and accessible parity | PASS | Desktop geometry follows Figma; 390/768/1440 reflow and keyboard focus are tested. |
| Verification is part of each feature | PASS | Build, lint and a focused Playwright footer test are planned. |

## Project Structure

### Documentation (this feature)

```text
specs/002-marketplace-footer/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── newsletter.md
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── assets/footer/                 # exported Figma social SVGs
├── features/home/components/
│   ├── home-footer.tsx            # footer markup and newsletter interaction
│   └── home-page.tsx              # footer placement after discovery content
└── styles/design-system.css        # footer-specific semantic sizing tokens

e2e/
└── footer.spec.ts                 # desktop and mobile visible outcomes
```

**Structure Decision**: The footer is a home feature component because it is only used at the end of the home page. Static Figma SVGs live with a dedicated footer asset folder, while its responsive dimensions are added to the existing design token file.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
No constitution violations or additional complexity are required.
