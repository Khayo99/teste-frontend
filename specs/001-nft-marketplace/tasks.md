# Tasks: NFT Marketplace Home

## Phase 1: Setup

- [X] T001 Define the home-frame implementation plan in specs/001-nft-marketplace/plan.md
- [X] T002 Record catalog entities and interface contract in specs/001-nft-marketplace/data-model.md and specs/001-nft-marketplace/contracts/catalog.md
- [X] T003 Download Figma node assets into src/assets/home

## Phase 2: Foundational

- [X] T004 Create strict catalog domain types in src/@types/catalog.ts
- [X] T005 Create typed catalog fixtures and filter behavior in src/features/catalog/data/catalog-fixtures.ts and src/features/catalog/lib/filter-catalog.ts

## Phase 3: User Story 1 - Discover and evaluate NFTs

**Goal**: Deliver the desktop Figma home frame with a searchable, filterable and sortable catalog.

**Independent Test**: Open the home route, select a collection or network, change sort order and search
for a card to confirm the grid changes without losing visual structure.

- [X] T006 [US1] Build reusable filter controls in src/features/catalog/components/catalog-filters.tsx
- [X] T007 [US1] Build reusable NFT cards in src/features/catalog/components/nft-card.tsx
- [X] T008 [US1] Build the Figma home header, hero and catalog composition in src/features/home
- [X] T009 [US1] Mount the home page through TanStack Router in src/router.tsx
- [X] T010 [US1] Validate type checking, linting, production build and rendered desktop home frame
- [X] T011 [US1] Extract Figma variables, typography, radii, spacing and shadow into src/styles/design-system.css
- [X] T012 [US1] Load Roboto Mono locally and replace component-level visual values with semantic design tokens
- [X] T013 [US1] Align the desktop header, hero, filters and three-column catalog grid with the exact Figma geometry
- [X] T014 [US1] Document the extracted source-of-truth tokens and usage rules in DESIGN_SYSTEM.md
- [X] T015 [US1] Record mandatory Figma fidelity and responsive validation rules in DESIGN_SYSTEM.md and spec.md
- [X] T016 [US1] Replace arbitrary component values with semantic Tailwind theme tokens for color, type and geometry

## Dependencies & Execution Order

T001 through T005 establish the typed catalog foundation. T006 and T007 support T008. T009 mounts the
composition and T010 validates the completed frame.
