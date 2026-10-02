# Implementation Plan: Autenticação — Login e Cadastro

**Branch**: `004-auth-login-register` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

## Summary

A feature adiciona cadastro, login, logout, sessão persistente e proteção das áreas privadas ao frontend React existente. A implementação usa Axios para transporte, MSW para a API fictícia, Zod para validação, TanStack Query para estado remoto/cache e Zustand para sessão e contexto de retomada. A sessão persiste apenas token fictício e metadados; senha nunca é persistida ou registrada.

## Technical Context

**Language/Version**: TypeScript 6 / React 19  
**Primary Dependencies**: TanStack Router, TanStack Query, Axios, Zod, Zustand, MSW, Socket.IO client, Playwright  
**Storage**: localStorage para token fictício, usuário e contexto de retomada; memória para query cache  
**Testing**: TypeScript build/typecheck, ESLint, Playwright E2E com MSW  
**Target Platform**: navegador moderno, responsivo em 390, 768 e 1440px  
**Project Type**: aplicação web frontend single-page  
**Performance Goals**: evitar requisições duplicadas e manter autenticação sem bloqueio perceptível  
**Constraints**: credenciais fictícias; sem senha em claro em storage/logs; cache isolado por usuário; retorno a rotas privadas  
**Scale/Scope**: autenticação e guardas para checkout, perfil, carteiras, favoritos e pedidos; uma aba conforme a spec

## Constitution Check

Passa. O plano mantém React/TypeScript e as responsabilidades existentes de Axios, TanStack Query, MSW, Socket.IO e Playwright. Contratos, cenários MSW, política de cache/sessão, comportamento responsivo e a limitação de ausência de acesso ao conteúdo do Figma estão documentados nos artefatos.

## Project Structure

```text
src/
├── features/auth/
│   ├── api/auth-api.ts
│   ├── components/auth-form.tsx
│   ├── auth-page.tsx
│   ├── auth-store.ts
│   └── lib/auth-validation.ts
├── components/authenticated-route.tsx
├── lib/realtime.ts
├── mocks/handlers.ts
├── router.tsx
└── index.css
e2e/auth.spec.ts
```

**Structure Decision**: Single Vite SPA. A feature slice owns UI, validation and API adapters; shared routing, realtime cleanup and mock handlers remain in `src/`. Existing home/catalog flows are preservados e rotas protegidas placeholder são adicionadas para tornar o comportamento testável.

## Design Decisions

- A sessão é recuperada com `GET /api/auth/session`; falha/expiração limpa o estado e salva `returnTo`.
- Login/cadastro usam mutations Axios; a API MSW retorna erros estruturados e credenciais fictícias.
- Logout cancela queries privadas, remove cache persistido e desconecta subscriptions Socket.IO.
- Guards do TanStack Router redirecionam para `/login?returnTo=...`; após autenticação o destino é restaurado.
- Formulários compartilham componentes acessíveis, validação Zod, estado de loading e erro associado.
- Como o conteúdo dos nós Figma não está disponível nesta sessão, o layout usa os assets e tokens locais; a limitação será registrada no `ARCHITECTURE.md`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| N/A | N/A | No constitution violations. |
