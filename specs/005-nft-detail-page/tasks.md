# Tasks: Detalhes do NFT

**Input**: Design documents from `/specs/005-nft-detail-page/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/nft-detail.md, quickstart.md

**Tests**: Não solicitados explicitamente para unidade; a validação E2E (Playwright) é tratada como
parte da verificação de cada fase, conforme a constituição do projeto.

**Organization**: Tarefas agrupadas por user story (spec.md), precedidas por Setup e Foundational
(layout global). O refactor de header/footer é tratado como Foundational porque bloqueia qualquer
tela nova que precise de header/footer consistentes, incluindo a de detalhe do NFT.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefas incompletas)
- **[Story]**: User story à qual a tarefa pertence (US1..US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar tipos, fixtures e rota base antes de qualquer lógica de negócio.

- [ ] T001 Criar `src/@types/nft-detail.ts` com os tipos `NftDetail`, `CollectorReview`, `Favorite` e
      `RelatedNft` descritos em `data-model.md`, estendendo `Nft` de `src/@types/catalog.ts` (campos:
      `gallery`, `editionLabel`, `description`, `attributes`, `collection`, `contractAddress`,
      `copyright`, `reviews: { average, count }`, `reviewsList: CollectorReview[]`,
      `relatedNfts: RelatedNft[]`, `isFavorite?: boolean`).
- [ ] T002 [P] Criar pasta `src/features/nft-detail/` com subpastas `api/`, `components/`, `lib/`
      seguindo o padrão de `src/features/catalog/`.
- [ ] T003 [P] Estender `src/features/catalog/data/catalog-fixtures.ts` (ou criar
      `src/features/nft-detail/data/nft-detail-fixtures.ts`) com dados completos de `NftDetail` para
      cada NFT já existente no catálogo, incluindo `reviewsList`, `relatedNfts` (NFTs da mesma
      `collection`) e ao menos um NFT com `availability: 0` para cobrir o cenário de edição esgotada.

**Checkpoint**: Tipos e fixtures prontos; nenhuma tela ainda foi alterada.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Layout global (header/footer) e infraestrutura de rota/API que toda user story depende.

**⚠️ CRITICAL**: Nenhuma user story pode começar antes desta fase terminar — é o requisito FR-005.

- [ ] T004 Criar `src/components/app-layout.tsx` que renderiza `HomeHeader`, `children` (ou
      `<Outlet />` quando usado diretamente na rota raiz) e `HomeFooter`, lendo os componentes já
      existentes em `src/features/home/components/home-header.tsx` e
      `src/features/home/components/home-footer.tsx` sem duplicar sua lógica.
- [ ] T005 Atualizar `src/router.tsx`: a `rootRoute` passa a renderizar `<AppLayout><Outlet /></AppLayout>`
      em vez do `<main>` atual; remover qualquer renderização de header/footer feita diretamente pela
      rota raiz.
- [ ] T006 Atualizar `src/features/home/home-page.tsx` para deixar de renderizar `HomeHeader`/
      `HomeFooter` diretamente (agora herdados do layout global) e manter apenas hero/catálogo/
      discovery.
- [ ] T007 Atualizar `src/features/auth/auth-page.tsx` para parar de usar `<HomePage />` como fundo do
      modal — o conteúdo de fundo passa a ser o que a navegação já resolveu (header/footer vêm do
      layout global; `AuthPage` renderiza apenas o modal/overlay de autenticação).
- [ ] T008 Confirmar/ajustar `src/features/protected/protected-page.tsx` (ou equivalente) para que,
      agora recebendo header/footer do layout global automaticamente, não precise de nenhuma alteração
      de estrutura além de validar visualmente que nada quebrou.
- [ ] T009 Registrar a rota `/nft/$nftId` em `src/router.tsx` via `createRoute`, seguindo o mesmo
      padrão de `loginRoute`, pública (sem guard de autenticação), apontando para
      `src/features/nft-detail/nft-detail-page.tsx` (arquivo criado em T012).
- [ ] T010 [P] Criar `src/features/nft-detail/api/nft-detail-api.ts` com `getNftDetail(id: string,
      token?: string)` chamando `GET /api/nfts/:id` via `api` (Axios, `src/lib/api.ts`), retornando
      `NftDetail`, e `setFavorite(nftId: string, token: string, favorite: boolean)` chamando
      `POST`/`DELETE /api/favorites/:nftId` conforme `contracts/nft-detail.md`; erros seguem o mesmo
      padrão `{ message }` de `src/features/auth/api/auth-api.ts`.
- [ ] T011 [P] Adicionar em `src/mocks/handlers.ts` os handlers `GET /api/nfts/:id` (retorna 404 com
      `{ message }` se o `id` não existir nas fixtures; inclui `isFavorite` apenas quando
      `Authorization: Bearer <token>` corresponder a uma sessão válida), `POST /api/favorites/:nftId`
      e `DELETE /api/favorites/:nftId` (ambos exigem Bearer token válido, retornam 401 com
      `{ message }` caso contrário, e mantêm um mapa em memória `userId -> Set<nftId>` análogo ao
      padrão já usado para `sessions`/`users`).
- [ ] T012 [P] Criar `src/features/nft-detail/lib/nft-detail-validation.ts` com
      `clampQuantity(quantity: number, availability: number): number` que nunca retorna valor menor
      que 1 nem maior que `availability` (regra de `NftDetailQuantity` em `data-model.md`); quando
      `availability` é 0, o chamador deve tratar separadamente (controles desabilitados), não a função.
- [ ] T013 Criar esqueleto de `src/features/nft-detail/nft-detail-page.tsx` com `useParams` para
      `nftId`, `useQuery` chamando `getNftDetail`, e os três estados principais (carregando, erro com
      "tentar novamente", NFT não encontrado) preservando o layout global (header/footer herdados).

**Checkpoint**: Layout global aplicado a todas as rotas; rota `/nft/$nftId` existe e já trata
carregamento/erro/não encontrado. A partir daqui, cada user story pode ser implementada e testada de
forma independente.

---

## Phase 3: User Story 1 - Visualizar os detalhes de um NFT (Priority: P1) 🎯 MVP

**Goal**: Exibir fielmente ao Figma (desktop `10:244`, mobile `15:5536`) a galeria, nome, preço,
avaliação, descrição, edição e metadados de um NFT acessado a partir do catálogo ou diretamente por
URL.

**Independent Test**: A partir do catálogo, selecionar qualquer NFT e confirmar que a URL muda para a
rota de detalhe, os dados exibidos correspondem ao item selecionado, e acessar a URL diretamente (ou
recarregar) produz o mesmo resultado, em desktop e mobile.

- [ ] T014 [US1] Adicionar link/navegação em `src/features/catalog/components/nft-card.tsx` para
      `/nft/$nftId` usando o `id` do NFT (componente `Link` do TanStack Router), preservando o
      comportamento visual atual do card.
- [ ] T015 [P] [US1] Criar `src/features/nft-detail/components/nft-gallery.tsx`: miniaturas + imagem
      principal com zoom, renderizando `NftDetail.gallery` (lista não vazia conforme `data-model.md`),
      fiel aos frames desktop/mobile.
- [ ] T016 [P] [US1] Criar `src/features/nft-detail/components/nft-metadata.tsx` exibindo nome, preço
      em ETH (via `decimal.js` para qualquer formatação), avaliação por estrelas com contagem
      (`reviews.average`/`reviews.count`), descrição curta, badge de edição (`editionLabel`: `1/1`,
      `1/10`, `1/50`, `ABERTA`) e metadados (ID do token, coleção, atributos).
- [ ] T017 [US1] Montar `src/features/nft-detail/nft-detail-page.tsx` compondo `NftGallery` e
      `NftMetadata` (de T015/T016) no layout fiel ao Figma para desktop (1440px) e mobile (390px),
      substituindo o esqueleto criado em T013.
- [ ] T018 [US1] Implementar compartilhamento social (botões LinkedIn/mensagem/Twitter-X) em
      `src/features/nft-detail/components/nft-metadata.tsx` (ou componente dedicado
      `nft-share-buttons.tsx`) usando links padrão (`mailto:`, intents de rede social) com a URL atual
      da página, sem integração de analytics customizada (conforme Assumption do spec).
- [ ] T019 [US1] Garantir, em `src/features/nft-detail/nft-detail-page.tsx`, que o estado "NFT não
      encontrado" (id inexistente) exibe um link de volta ao catálogo (`/`), mantendo header/footer
      globais visíveis (FR-011).
- [ ] T020 [US1] Adicionar cenário Playwright em `e2e/nft-detail.spec.ts`: navegar do catálogo até o
      detalhe, validar dados exibidos, recarregar a página e validar persistência do conteúdo, e
      validar o estado "não encontrado" para um id inexistente.

**Checkpoint**: Tela de detalhes navegável, fiel ao Figma, sobrevive a recarregamento e trata NFT
inexistente — entregável como MVP independente.

---

## Phase 4: User Story 2 - Ajustar quantidade e comprar um NFT (Priority: P1)

**Goal**: Seletor de quantidade respeitando a disponibilidade da edição e ação "Comprar" conduzindo ao
checkout existente, com autenticação preservando a intenção original.

**Independent Test**: Ajustar quantidade (mínimo 1, máximo = disponibilidade), acionar "Comprar" e
confirmar condução ao checkout com NFT/quantidade corretos, autenticando-se antes se necessário.

- [ ] T021 [P] [US2] Criar `src/features/nft-detail/components/nft-purchase-panel.tsx` com seletor de
      quantidade usando `clampQuantity` (T012): incremento/decremento desabilitados nos limites 1 e
      `availability`; quando `availability === 0`, desabilitar quantidade e botão "Comprar" exibindo
      texto de indisponibilidade (FR-007).
- [ ] T022 [US2] No botão "Comprar" de `nft-purchase-panel.tsx`, verificar sessão via
      `src/features/auth/auth-store.ts`: se não autenticado, navegar para
      `/login?returnTo=/nft/${nftId}` preservando a quantidade selecionada (ex.: via query param ou
      estado de navegação); se autenticado, navegar para `/checkout` passando `nftId` e `quantity`
      via estado de navegação do TanStack Router (FR-008, FR-010).
- [ ] T023 [US2] Integrar `NftPurchasePanel` em `src/features/nft-detail/nft-detail-page.tsx`,
      posicionado conforme o Figma (painel de compra desktop / barra fixa mobile).
- [ ] T024 [US2] Adicionar cenários Playwright em `e2e/nft-detail.spec.ts`: incrementar/decrementar
      quantidade respeitando limites, verificar estado desabilitado com `availability: 0`, e validar
      redirecionamento de "Comprar" sem sessão com retomada após login simulado.

**Checkpoint**: Compra iniciável de ponta a ponta (incluindo autenticação) de forma independente de
US3/US4/US5.

---

## Phase 5: User Story 3 - Favoritar um NFT (Priority: P2)

**Goal**: Alternar e persistir o estado de favorito de um NFT para pessoas autenticadas, com
redirecionamento de autenticação preservando a intenção para quem não está autenticado.

**Independent Test**: Autenticada, favoritar um NFT, recarregar a página e confirmar que o estado
permanece; desfavoritar e confirmar a reversão; sem sessão, confirmar redirecionamento com retomada.

- [ ] T025 [US3] Adicionar botão "Favoritar" em `src/features/nft-detail/components/nft-purchase-panel.tsx`
      (ou componente dedicado `nft-favorite-button.tsx`), usando `isFavorite` retornado por
      `getNftDetail` como estado inicial.
- [ ] T026 [US3] Implementar a mutação de favorito em `src/features/nft-detail/nft-detail-page.tsx`
      (ou hook dedicado `use-nft-favorite.ts`) chamando `setFavorite` (T010) via TanStack Query
      `useMutation`, com atualização otimista do botão e invalidação/atualização do cache da query de
      detalhe do NFT (FR-009).
- [ ] T027 [US3] Quando não autenticado, o clique em "Favoritar" MUST navegar para
      `/login?returnTo=/nft/${nftId}`, retomando a tela de detalhes com o NFT já favoritado após a
      autenticação (reaproveitar o mesmo mecanismo de `returnTo` já usado por `auth-store`/`AuthPage`)
      (FR-010).
- [ ] T028 Adicionar cenário Playwright em `e2e/nft-detail.spec.ts`: favoritar autenticado, recarregar
      e confirmar persistência; desfavoritar e confirmar reversão; tentar favoritar sem sessão e
      confirmar redirecionamento com retomada do estado favoritado pós-login.

**Checkpoint**: Favoritar funcional e persistente, independente de US4/US5.

---

## Phase 6: User Story 4 - Avaliar e consultar avaliações de colecionadores (Priority: P3)

**Goal**: Abas "Detalhes do NFT" e "Avaliações de colecionadores (N)" alternáveis sem recarregar a
página, cada uma exibindo o conteúdo correto.

**Independent Test**: Alternar entre as duas abas e confirmar que cada uma mostra o conteúdo correto
(descrição/rede/contrato/direitos autorais vs. nota média + avaliações) sem recarregar a página.

- [ ] T029 [P] [US4] Criar `src/features/nft-detail/components/nft-info-tabs.tsx` com duas abas
      controladas por estado local: "Detalhes do NFT" (descrição completa, rede, contrato, direitos
      autorais) e `Avaliações de colecionadores (N)` com `N = reviews.count`, exibindo `reviews.average`
      e a lista `reviewsList` (autor, nota, comentário, data).
- [ ] T030 [US4] Integrar `NftInfoTabs` em `src/features/nft-detail/nft-detail-page.tsx`, posicionado
      conforme o Figma, sem afetar galeria/painel de compra ao alternar de aba.
- [ ] T031 Adicionar cenário Playwright em `e2e/nft-detail.spec.ts`: alternar entre as abas e validar
      o conteúdo específico de cada uma, incluindo a contagem `(N)` correta no rótulo da aba.

**Checkpoint**: Abas funcionais, independentes de US5.

---

## Phase 7: User Story 5 - Descobrir NFTs relacionados (Priority: P3)

**Goal**: Carrossel "Mais desta coleção" navegável por indicadores (dots), levando à tela de detalhes
do item relacionado selecionado.

**Independent Test**: Usar os controles/pontos do carrossel para navegar os itens relacionados e
selecionar um deles, confirmando a navegação para a tela de detalhes desse item.

- [ ] T032 [US5] Criar `src/features/nft-detail/components/related-nfts-carousel.tsx` renderizando
      `NftDetail.relatedNfts` com indicadores (dots) e navegação por item/página; quando a coleção
      tiver menos itens relacionados que posições do carrossel, exibir somente os itens disponíveis
      sem posições vazias (edge case do spec).
- [ ] T033 [US5] Cada item do carrossel navega para `/nft/$nftId` do NFT relacionado (reutilizando o
      `Link` já usado em T014), repetindo o comportamento de US1.
- [ ] T034 [US5] Integrar `RelatedNftsCarousel` ao final de
      `src/features/nft-detail/nft-detail-page.tsx`, conforme posição no Figma.
- [ ] T035 Adicionar cenário Playwright em `e2e/nft-detail.spec.ts`: navegar pelos dots do carrossel e
      selecionar um item relacionado, validando a navegação para a tela de detalhes correspondente.

**Checkpoint**: Todas as 5 user stories entregues e testáveis de forma independente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade geral, responsividade final e verificação completa.

- [ ] T036 [P] Revisar responsividade de toda a tela de detalhes em 390px, 768px e 1440px contra os
      frames do Figma (desktop `10:244`, mobile `15:5536`), ajustando espaçamentos/quebras conforme
      necessário (FR-015).
- [ ] T037 [P] Revisar acessibilidade: `aria-label` em controles de quantidade/favoritar/compartilhar,
      foco visível, textos alternativos de imagens da galeria, e indicação textual (não só cor) para
      estados de edição indisponível/favoritado.
- [ ] T038 Executar o roteiro completo de `quickstart.md` manualmente (navegação, layout global,
      quantidade/disponibilidade, favoritar com/sem sessão, comprar, abas, carrossel, NFT não
      encontrado).
- [ ] T039 Rodar `npm run typecheck`, `npm run lint`, `npm run build` e `npm run test:e2e`, corrigindo
      quaisquer falhas antes de considerar a feature concluída.
- [X] T040 [US1] Implementar a composição do frame mobile `15:5536` em
      `src/features/nft-detail/{nft-detail-page.tsx,components/nft-gallery.tsx,components/nft-purchase-panel.tsx}`:
      hero com ações sobrepostas, details sheet e barra de compra fixa; salvar e usar os assets locais
      em `src/assets/nft-detail/mobile/`.
- [X] T041 [US1] Adicionar a cobertura mobile de hero, CTA e ajuste de quantidade em
      `e2e/nft-detail-mobile.spec.ts`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente.
- **Foundational (Phase 2)**: Depende de Setup (T001-T003) para os tipos usados pela API/fixtures.
  Bloqueia todas as user stories (T004-T013 incluem o refactor de layout global, FR-005).
- **User Stories (Phase 3-7)**: Todas dependem de Foundational estar completo. Entre si:
  - US1 (P1) não depende de nenhuma outra user story — é a base visual.
  - US2 (P1) depende de US1 estar com a página montada (T017) para integrar o painel de compra, mas é
    testável de forma independente a partir daí.
  - US3 (P2) depende de US1 (painel/página existente) e reaproveita o `isFavorite` retornado no mesmo
    endpoint de US1/US2; pode ser implementada em paralelo a US4/US5 depois que US1 estiver pronta.
  - US4 (P3) depende apenas de US1 (página existente); independente de US2/US3/US5.
  - US5 (P3) depende apenas de US1 (página e `Link` de navegação existentes); independente de
    US2/US3/US4.
- **Polish (Phase 8)**: Depende de todas as user stories desejadas para o escopo da entrega estarem
  completas.

### User Story Dependency Graph

```text
Setup (P1) ─▶ Foundational (P2, inclui layout global) ─▶ US1 (P1) ─┬─▶ US2 (P1)
                                                                    ├─▶ US3 (P2)
                                                                    ├─▶ US4 (P3)
                                                                    └─▶ US5 (P3)
```

### Within Each User Story

- Componentes de UI [P] podem ser criados em paralelo quando em arquivos distintos (ex.: T015/T016;
  T021 isolado).
- Tarefas de integração na página (`nft-detail-page.tsx`) são sequenciais entre si, pois editam o
  mesmo arquivo.
- Tarefas de teste Playwright de uma story vêm depois da integração funcional daquela story.

## Parallel Execution Examples

**Setup**: T002 e T003 podem rodar em paralelo após T001.

**Foundational**: T010, T011 e T012 podem rodar em paralelo (arquivos distintos); T004-T009 e T013
são sequenciais (mesmo arquivo `router.tsx`/dependências diretas entre si).

**US1**: T015 e T016 podem rodar em paralelo; T014 é independente e pode rodar em paralelo com ambos.

**Entre stories** (após Foundational + US1 completos): US3, US4 e US5 podem ser implementadas em
paralelo por pessoas/sessões diferentes, pois tocam arquivos de componente distintos
(`nft-favorite-button`/`nft-info-tabs`/`related-nfts-carousel`) e só se integram ao mesmo arquivo
`nft-detail-page.tsx` no passo final de cada uma.

## Implementation Strategy

### MVP First (US1 apenas)

1. Completar Phase 1 (Setup) + Phase 2 (Foundational, incluindo layout global).
2. Completar Phase 3 (US1): tela de detalhes navegável, fiel ao Figma, com estados de
   carregamento/erro/não encontrado.
3. **STOP and VALIDATE**: rodar o Independent Test de US1 e os cenários Playwright de T020.
4. Entregar/demonstrar o MVP antes de seguir.

### Incremental Delivery

1. Setup + Foundational → base compartilhada (layout global + rota + API mock) pronta.
2. US1 → MVP visualizável e navegável (entregar/testar).
3. US2 → fluxo de compra (entregar/testar) — maior valor de negócio, ainda P1.
4. US3 → favoritos (entregar/testar).
5. US4 → abas de detalhes/avaliações (entregar/testar).
6. US5 → carrossel de relacionados (entregar/testar).
7. Polish → responsividade/acessibilidade final e verificação completa (typecheck/lint/build/e2e).

Cada etapa acima é um incremento entregável e testável de forma independente, sem quebrar o que já
foi entregue nas etapas anteriores.
