# Research: Detalhes do NFT

## Layout global (header/footer)

- **Decision**: Extrair `HomeHeader`/`HomeFooter` de `home-page.tsx` para um componente
  `src/components/app-layout.tsx`, aplicado uma única vez na `rootRoute` do TanStack Router
  (`src/router.tsx`), envolvendo `<Outlet />`.
- **Rationale**: Hoje só a Home renderiza header/footer; `ProtectedPage` não tem nenhum dos dois e
  `AuthPage` depende de renderizar `<HomePage />` por baixo do modal só para herdar o header/footer.
  Isso duplicaria lógica na nova rota de detalhe e perpetuaria a inconsistência já observada pelo
  usuário. Um layout de rota raiz é o padrão idiomático do TanStack Router para casca compartilhada.
- **Alternatives considered**: (a) renderizar `HomeHeader`/`HomeFooter` manualmente em cada página nova
  — rejeitado por duplicar código e já ter causado a inconsistência atual; (b) usar um layout por grupo
  de rotas (ex.: rotas públicas vs. protegidas) — desnecessário, pois header/footer são idênticos em
  todas as rotas existentes e planejadas.

## Roteamento do detalhe do NFT

- **Decision**: Nova rota `/nft/$nftId` via `createRoute` (mesmo padrão de `protectedRoute` já usado),
  pública (sem guard de autenticação), carregando dados via `useQuery` dentro da página.
- **Rationale**: Consistente com as rotas existentes (`indexRoute`, `loginRoute`); o parâmetro de rota
  do TanStack Router já tipa `$nftId` automaticamente. Autenticação só é exigida nas ações (Favoritar,
  Comprar), não na visualização, conforme README ("Detalhe deve suportar acesso direto").
- **Alternatives considered**: Carregar via `loader` da rota (TanStack Router data loading) foi
  considerado, mas `useQuery` dentro do componente mantém consistência com o padrão já usado no
  catálogo (`getCatalogNfts` chamado via hook) e simplifica o estado de loading/erro reaproveitável.

## Dados de detalhe do NFT e avaliações

- **Decision**: Novo endpoint mock `GET /api/nfts/:id` no MSW, retornando um objeto `NftDetail` que
  estende os campos já existentes em `Nft` (catálogo) mais descrição, atributos, coleção, rede,
  contrato, direitos autorais, `reviews` (nota média + contagem) e `relatedNfts`.
- **Rationale**: Reaproveita o shape de dados já validado no catálogo, evitando duas fontes de verdade
  para nome/preço/imagem. Mantém o contrato REST tipado via Axios, como exigido pela constituição.
- **Alternatives considered**: Derivar o detalhe inteiramente no cliente a partir de `catalogNfts` sem
  passar pela rede foi rejeitado — quebraria o padrão de contrato REST tipado e o requisito de estados
  de loading/erro simulados via MSW.

## Favoritos

- **Decision**: Endpoints mock `POST /api/favorites/:nftId` e `DELETE /api/favorites/:nftId`
  autenticados via Bearer token (mesmo padrão de `auth-api.ts`), com estado em memória no MSW (mapa
  `userId -> Set<nftId>`), e o estado de favorito do NFT atual incluído na resposta de
  `GET /api/nfts/:id` quando a requisição estiver autenticada.
- **Rationale**: Segue o mesmo padrão de simulação de sessão já usado em `handlers.ts` (`sessions`,
  `users`); evita introduzir uma biblioteca ou mecanismo de persistência novo.
- **Alternatives considered**: Persistir favoritos só no cliente (localStorage) foi rejeitado — não
  atende ao requisito de persistir "para o usuário autenticado" de forma coerente com múltiplos
  dispositivos/sessões simuladas, e contraria o padrão de dados vindos da API mockada.

## Ação de comprar sem checkout completo

- **Decision**: O botão "Comprar" navega para a rota protegida `/checkout` já existente (atualmente um
  placeholder `ProtectedPage`), passando o `nftId` e a quantidade selecionada via estado de navegação
  do TanStack Router.
- **Rationale**: Evita duplicar ou antecipar o fluxo de checkout completo, que é uma feature própria
  fora deste escopo (conforme Assumption do spec), enquanto ainda demonstra a intenção de compra de
  forma testável (US2 do spec).
- **Alternatives considered**: Implementar um checkout completo nesta feature foi descartado por
  exceder o escopo definido na especificação.

## Precisão decimal em ETH

- **Decision**: Reaproveitar `decimal.js` (já instalado) para qualquer cálculo/formatação de preço
  total (preço unitário × quantidade) exibido na tela de detalhe.
- **Rationale**: `decimal.js` já é dependência do projeto especificamente para evitar erros de ponto
  flutuante em valores ETH, conforme constituição ("ETH values MUST remain decimal strings... use
  precision-safe arithmetic").
- **Alternatives considered**: Aritmética nativa de `Number` foi descartada por risco de imprecisão de
  ponto flutuante em valores decimais.
