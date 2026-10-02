# Tasks: Autenticação — Login e Cadastro

**Input**: Design documents from `/specs/004-auth-login-register/`

## Phase 1: Setup

- [X] T001 Verify auth feature directories and ignore files against `specs/004-auth-login-register/plan.md`
- [X] T002 [P] Define typed account/session contracts in `src/features/auth/api/auth-api.ts`

## Phase 2: Foundational

- [X] T003 [P] Add Zod schemas for name, email, password and confirmation in `src/features/auth/lib/auth-validation.ts`
- [X] T004 [P] Add session store with localStorage hydration, return context and user isolation in `src/features/auth/auth-store.ts`
- [X] T005 [P] Add MSW auth handlers for register, login, session, logout and deterministic expiration in `src/mocks/handlers.ts`
- [X] T006 Add auth API Axios methods and structured error normalization in `src/features/auth/api/auth-api.ts`
- [X] T007 Add session cleanup that cancels private TanStack Query data and removes Socket.IO listeners in `src/lib/realtime.ts` and `src/lib/query-client.ts`
- [X] T008 Add shared auth form primitives with accessible labels, field errors and pending state in `src/features/auth/components/auth-form.tsx`

## Phase 3: User Story 1 — Criar uma conta (P1) 🎯 MVP

**Goal**: visitante cria uma conta válida, inicia sessão e retorna ao contexto original.

**Independent Test**: cadastro válido autentica em uma submissão; e-mail duplicado e dados inválidos exibem erros sem apagar valores.

- [X] T009 [P] [US1] Add Playwright scenarios for successful registration and duplicate-email validation in `e2e/auth.spec.ts`
- [X] T010 [US1] Implement registration screen and responsive composition at `/register` in `src/features/auth/auth-page.tsx`
- [X] T011 [US1] Connect registration mutation, validation and return-to navigation in `src/features/auth/auth-page.tsx` and `src/features/auth/api/auth-api.ts`

## Phase 4: User Story 2 — Entrar com uma conta existente (P1)

**Goal**: visitante autentica com credenciais fictícias ou recebe erro genérico.

**Independent Test**: credenciais `demo@kurio.test` / `kurio-demo` entram em uma submissão; credenciais inválidas permanecem no login sem revelar o campo incorreto.

- [X] T012 [P] [US2] Add Playwright scenarios for valid and invalid login in `e2e/auth.spec.ts`
- [X] T013 [US2] Implement login screen, generic API error and validation in `src/features/auth/auth-page.tsx`
- [X] T014 [US2] Update home header to link to login and show authenticated user/logout action in `src/features/home/components/home-header.tsx`

## Phase 5: User Story 3 — Sessão e retomada durante navegação/checkout (P1)

**Goal**: sessão sobrevive refresh; expiração preserva rota, etapa e carrinho.

**Independent Test**: refresh mantém sessão; resposta 401 redireciona ao login e restaura a rota original.

- [X] T015 [P] [US3] Add protected route and return-to query handling in `src/components/authenticated-route.tsx` and `src/router.tsx`
- [X] T016 [P] [US3] Add protected placeholder pages for checkout, profile, wallets, favorites and orders in `src/features/auth/protected-pages.tsx`
- [X] T017 [US3] Hydrate and validate session on app startup, handling expiration in `src/main.tsx` and `src/features/auth/auth-store.ts`
- [X] T018 [US3] Preserve checkout query/step context through authentication in `src/router.tsx` and `src/features/auth/auth-page.tsx`
- [X] T019 [P] [US3] Add Playwright coverage for refresh and protected-route restoration in `e2e/auth.spec.ts`

## Phase 6: User Story 4 — Encerrar sessão e trocar usuário (P2)

**Goal**: logout remove dados privados e subscriptions antes de nova sessão.

**Independent Test**: logout remove sessão e novo usuário não vê identidade/cache do anterior.

- [X] T020 [US4] Implement logout mutation, store reset and query-cache cleanup in `src/features/auth/auth-store.ts` and `src/features/auth/api/auth-api.ts`
- [X] T021 [US4] Add realtime session start/end lifecycle and stale-event protection in `src/lib/realtime.ts`
- [X] T022 [P] [US4] Add Playwright coverage for logout and same-tab user switching in `e2e/auth.spec.ts`

## Phase 7: User Story 5 — Proteger áreas autenticadas (P2)

**Goal**: checkout, perfil, carteiras, favoritos e pedidos exigem sessão.

**Independent Test**: acesso direto sem sessão redireciona ao login e retorna exatamente à rota solicitada.

- [X] T023 [US5] Register all protected routes and route-level guard behavior in `src/router.tsx`
- [X] T024 [US5] Add navigation links and authenticated-area affordances in `src/features/auth/protected-pages.tsx`
- [X] T025 [P] [US5] Add Playwright matrix for all protected routes in `e2e/auth.spec.ts`

## Phase 8: Polish & Cross-Cutting

- [X] T026 [P] Update README auth credentials, scenarios, reset and session policy in `README.md`
- [X] T027 [P] Document Figma availability limitation and auth architecture decisions in `ARCHITECTURE.md`
- [X] T028 Run `npm run typecheck`, `npm run lint`, `npm run build` and relevant Playwright tests; fix regressions
- [X] T029 Run quickstart validation from `specs/004-auth-login-register/quickstart.md` and mark all completed tasks `[X]`

## Dependencies & Execution Order

Foundational tasks T003–T008 block all stories. US1 and US2 can proceed after foundation; US3 depends on the session store and auth screens; US4 depends on the session lifecycle; US5 depends on the guard created in US3. Polish follows all stories.

## Parallel Opportunities

T003–T005 can run in parallel. T015–T016 and T019 can run in parallel after the session foundation. E2E additions are parallel by story only when they do not edit conflicting sections of `e2e/auth.spec.ts`.

## Implementation Strategy

Deliver US1 + US2 as the MVP, then add session recovery/guards, cleanup and complete protected-route coverage. Validate typecheck/lint/build and E2E after each story checkpoint.
