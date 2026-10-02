# Implementation Plan: Detalhes do NFT

**Branch**: `005-nft-detail-page` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-nft-detail-page/spec.md`

## Summary

Implementar a tela de detalhes do NFT (Figma `Desktop / Detalhes do NFT` node `10:244` e
`Mobile / Detalhes do NFT` node `15:5536`) como uma nova rota `/nft/$nftId`, reaproveitando os tipos e
fixtures do catálogo existente. A tela cobre galeria de imagens, preço/avaliação, descrição, seleção
de edição, quantidade, ações Comprar/Favoritar, metadados, compartilhamento social, abas de
detalhes/avaliações e carrossel de relacionados. Como pré-requisito estrutural, header e footer são
extraídos de `home-page.tsx` para um layout global aplicado na `rootRoute` do TanStack Router, para
que todas as rotas (incluindo a nova) compartilhem a mesma casca visual.

## Technical Context

**Language/Version**: TypeScript 6, React 19

**Primary Dependencies**: TanStack Router, TanStack Query, Axios, Zustand, MSW, Tailwind CSS,
lucide-react, decimal.js

**Storage**: Dados do NFT e avaliações servidos por MSW (mock); favoritos persistidos por usuário via
MSW + cache do TanStack Query, com estado de UI local em Zustand quando necessário

**Testing**: TypeScript build/typecheck, ESLint, Playwright E2E (navegação do catálogo até o detalhe,
quantidade/disponibilidade, favoritar, abas, carrossel)

**Target Platform**: Navegador moderno, responsivo em 390, 768 e 1440px

**Project Type**: Aplicação web frontend single-page (Vite SPA existente)

**Constraints**: Sem `any`/`unknown` explícitos; tipos em `src/@types`; sem comentários supérfluos;
assets do Figma baixados e referenciados localmente; valores em ETH como strings decimais com
aritmética seguitable via `decimal.js`; favoritar/comprar exigem autenticação e preservam intenção
original (retomada pós-login)

**Scale/Scope**: Esta entrega cobre a tela de detalhes do NFT (desktop e mobile) e o refactor de
header/footer para layout global. Não inclui o checkout completo, nem a criação de avaliações pela
pessoa usuária (ambos fora de escopo, conforme Assumptions do spec).

## Constitution Check

*GATE: Deve passar antes da Fase 0 e ser reavaliado após a Fase 1.*

| Gate | Resultado | Evidência |
|---|---|---|
| Figma e brief governam o resultado | Pass | Nodes `10:244` (desktop) e `15:5536` (mobile) são o alvo visual; README define comportamento de favoritos/compra/autenticação. |
| Stack obrigatória usada por responsabilidade | Pass | TanStack Router (rota de detalhe), TanStack Query (dados do NFT/avaliações/favorito), Axios (transporte), MSW (mock), Tailwind (estilo), Zustand (estado de sessão/UI já existente). |
| Integridade de dados preservada | Pass | Preço em ETH tratado como string decimal; disponibilidade da edição limita quantidade/compra/favoritar. |
| Interface responsiva e acessível | Pass | Layout fiel aos frames desktop/mobile; controles com `aria-label`, foco visível e feedback não dependente só de cor (ex.: texto "ABERTA"/indisponível). |
| Verificação planejada | Pass | Playwright cobre navegação, limites de quantidade, favoritar, abas e carrossel; typecheck/lint/build fazem parte do quickstart. |

Nenhuma violação da constituição identificada; `Complexity Tracking` permanece vazio.

## Project Structure

### Documentation (this feature)

```text
specs/005-nft-detail-page/
├── plan.md              # Este arquivo
├── research.md           # Fase 0
├── data-model.md         # Fase 1
├── quickstart.md         # Fase 1
├── contracts/
│   └── nft-detail.md     # Fase 1
└── tasks.md              # Fase 2 ($speckit-tasks, ainda não criado)
```

### Source Code (repository root)

```text
src/
├── @types/
│   └── nft-detail.ts                 # Novos tipos: NftDetail, CollectorReview, RelatedNft
├── components/
│   └── app-layout.tsx                # Layout global: header + <Outlet/> + footer
├── features/
│   ├── home/
│   │   ├── home-page.tsx             # Passa a renderizar só hero/catálogo/discovery
│   │   └── components/
│   │       ├── home-header.tsx       # Movido/reexportado via app-layout
│   │       └── home-footer.tsx       # Movido/reexportado via app-layout
│   ├── catalog/
│   │   ├── components/nft-card.tsx   # Ganha link para /nft/$nftId
│   │   └── data/catalog-fixtures.ts  # Estendido com campos de detalhe
│   └── nft-detail/
│       ├── api/nft-detail-api.ts     # GET /api/nfts/:id, POST favorito
│       ├── components/
│       │   ├── nft-gallery.tsx
│       │   ├── nft-purchase-panel.tsx
│       │   ├── nft-info-tabs.tsx
│       │   └── related-nfts-carousel.tsx
│       ├── lib/nft-detail-validation.ts  # Limites de quantidade/disponibilidade
│       └── nft-detail-page.tsx
├── mocks/handlers.ts                 # Novos handlers: detalhe, avaliações, favoritos
└── router.tsx                        # rootRoute usa AppLayout; nova rota /nft/$nftId

e2e/
└── nft-detail.spec.ts
```

**Structure Decision**: Mantém a organização por feature module já usada em `catalog` e `auth`. O
layout global vive em `src/components/app-layout.tsx` (paralelo a `authenticated-route.tsx`) e é
aplicado uma única vez na `rootRoute`, eliminando a duplicação atual de header/footer apenas na Home.
A nova feature `nft-detail` segue o mesmo padrão `api/components/lib` de `catalog`.

## Design Decisions

- **Layout global**: `rootRoute` em `src/router.tsx` passa a renderizar `<AppLayout><Outlet /></AppLayout>`
  em vez de um `<main>` simples. `AppLayout` renderiza `HomeHeader`, o conteúdo da rota e `HomeFooter`.
  `home-page.tsx` deixa de renderizar header/footer diretamente. `AuthPage` deixa de precisar renderizar
  `<HomePage />` como fundo — o layout global já fornece header/footer; o conteúdo da rota por trás do
  modal passa a ser o que a navegação já resolveu (ex.: Home, Detalhe do NFT).
- **Rota de detalhe**: `createRoute({ path: '/nft/$nftId' })`, com `loader`/`useQuery` buscando o NFT
  pelo parâmetro; 404 tratado como estado "NFT não encontrado" dentro da própria página (não como rota
  404 genérica, para preservar header/footer e oferecer link de volta ao catálogo).
- **Dados do NFT**: Novo endpoint mock `GET /api/nfts/:id` retorna `NftDetail` (estende `Nft` com
  descrição curta/longa, atributos, coleção, rede, contrato, direitos autorais, edição/disponibilidade
  detalhada, `reviews: { average, count }` e `relatedNfts: RelatedNft[]`).
- **Avaliações**: Somente leitura nesta entrega (conforme Assumption do spec); nota média e contagem
  vêm do mesmo payload de detalhe, sem endpoint de escrita.
- **Favoritar**: `POST/DELETE /api/favorites/:nftId` autenticado via Bearer token (mesmo padrão de
  `auth-api.ts`); estado de favorito por usuário fica no MSW (mapa em memória, como `sessions`/`users`
  hoje) e é lido junto ao detalhe do NFT quando autenticado. Sem autenticação, aciona `/login` com
  `returnTo` apontando de volta para a tela de detalhe (reaproveitando o padrão já implementado em
  `auth-store`/`AuthPage`).
- **Quantidade e disponibilidade**: `nft-detail-validation.ts` expõe `clampQuantity(quantity,
  availability)` usado pelo seletor de quantidade; disponibilidade zero desabilita quantidade e
  "Comprar", exibindo rótulo de indisponibilidade (reaproveita o mesmo badge visual de "ABERTA"/edição
  do Figma para o estado fechado).
- **Comprar**: Botão "Comprar" navega para `/checkout` (rota protegida já existente,
  `ProtectedPage` placeholder) passando NFT e quantidade via estado de navegação/query — o checkout
  completo fica fora de escopo (Assumption do spec).
- **Compartilhamento social**: Botões abrem links padrão (`mailto:`, intents de LinkedIn/Twitter) com a
  URL atual da página, sem integração analítica customizada.
- **Preço em ETH**: Segue o padrão já usado no catálogo (string decimal); operações de soma/exibição
  usam `decimal.js`, já presente nas dependências do projeto, para evitar erro de ponto flutuante.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| N/A | N/A | Nenhuma violação da constituição identificada. |
