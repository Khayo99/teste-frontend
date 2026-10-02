# Tasks: Marketplace Footer

**Input**: Design documents from `/specs/002-marketplace-footer/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/newsletter.md

**Tests**: Playwright coverage is required by the project constitution for visible outcomes.

## Phase 1: Setup

- [X] T001 Create `src/assets/footer/` and download the five Figma-exported SVGs into that directory.
- [X] T002 [P] Add footer spacing and sizing tokens in `src/styles/design-system.css`.

---

## Phase 2: Foundational

- [X] T003 Define typed footer feature, link-group and social-link data in `src/features/home/components/home-footer.tsx` using the exact Figma copy and local asset imports.

---

## Phase 3: User Story 1 - Consultar recursos e novidades (Priority: P1) 🎯 MVP

**Goal**: Surface the three assurance blocks and usable newsletter signup at the end of the home page.

**Independent Test**: Scroll to the footer and submit both a valid and invalid e-mail.

- [X] T004 [P] [US1] Add newsletter submission coverage in `e2e/footer.spec.ts` for valid confirmation and invalid email feedback.
- [X] T005 [US1] Implement the feature assurances and accessible newsletter form in `src/features/home/components/home-footer.tsx`.
- [X] T006 [US1] Render `HomeFooter` as the final page child in `src/features/home/home-page.tsx`.

---

## Phase 4: User Story 2 - Navegar e entrar em contato (Priority: P2)

**Goal**: Present footer navigation, social links, wallet compatibility and contact information.

**Independent Test**: Use keyboard navigation from the newsletter through each footer link and confirm the visible focus state.

- [X] T007 [US2] Implement the brand/contact band, link columns, social SVG links, wallet chip and copyright section in `src/features/home/components/home-footer.tsx`.

---

## Phase 5: User Story 3 - Usar o footer em telas menores (Priority: P3)

**Goal**: Preserve all footer information and controls across narrow and medium viewports.

**Independent Test**: Verify the footer at 390 px, 768 px and 1440 px has no horizontal overflow and all controls are visible.

- [X] T008 [P] [US3] Add responsive footer coverage in `e2e/footer.spec.ts`.
- [X] T009 [US3] Add responsive grid and stack rules to `src/features/home/components/home-footer.tsx` and `src/styles/design-system.css`.

---

## Phase 6: Polish & Verification

- [X] T010 Run `npm run typecheck`, `npm run lint`, `npm run build` and `npm run test:e2e -- e2e/footer.spec.ts`; fix feature-scoped failures.
- [X] T011 Validate static SVG file presence, intended social slots and rendered desktop geometry against Figma node 70492:696.

## Dependencies & Execution Order

- T001 and T002 precede T003.
- T003 precedes T005 and T007.
- T005 precedes T006; T006 makes the MVP visible.
- T007 and T009 complete the remaining visual scope.
- T004 and T008 precede final verification; T010 and T011 complete last.

## Phase 7: Convergence

- [X] T012 Add explicit 768 px and 1440 px viewport assertions to `e2e/footer.spec.ts` per FR-008 and SC-001/SC-002 (partial).
- [X] T013 Add keyboard focus traversal assertions for footer controls in `e2e/footer.spec.ts` per FR-009 and SC-003 (partial).
