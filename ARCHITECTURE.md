# Arquitetura — Kurio NFT Marketplace

Este documento descreve a implementação existente e suas limitações. Não representa uma declaração de conformidade integral com o desafio. A verificação de entrega está em [docs/delivery-audit.md](docs/delivery-audit.md).

## Organização e responsabilidades

| Camada | Local | Responsabilidade |
| --- | --- | --- |
| Inicialização | `src/main.tsx` | Inicia MSW, instala sincronização de eventos, recupera sessão e monta React/Query/Router |
| Rotas | `src/router.tsx` | Busca tipada na URL, rotas públicas/privadas, fallback 404 e carregamento de telas |
| Funcionalidades | `src/features/` | Catálogo, detalhe, autenticação, carrinho, conta e pedidos |
| UI compartilhada | `src/components/`, `src/components/ui/` | Layout, header, footer e primitivas adaptadas ao tema |
| Transporte | `src/lib/api.ts` | Axios com base `/api`, JSON e timeout de 10 segundos |
| Cache | `src/lib/query-client.ts`, `src/lib/query-keys.ts` | Política de consultas, chaves e limpeza de dados privados |
| Tempo real | `src/lib/realtime.ts`, `src/lib/contracts.ts` | Socket.IO, validação Zod, ordenação de eventos e invalidação |
| Simulação | `src/mocks/` | REST MSW, banco local simulado e binding Socket.IO |
| Identidade visual | `src/styles/design-system.css`, `src/index.css`, `src/assets/` | Tokens Tailwind, estilos, imagens e fontes locais |
| Verificação | `e2e/`, `playwright.config.ts`, `lighthouse/`, `scripts/` | Testes, capturas visuais e auditoria de build |

React e TypeScript compõem a interface. TanStack Router controla navegação e parâmetros; TanStack Query mantém consultas e mutations; Axios envia REST. Tailwind e componentes locais no padrão shadcn/ui/CVA compõem o tema. Zustand mantém sessão, rascunhos de UI e carrinho. MSW intercepta HTTP e WebSocket; `@mswjs/socket.io-binding` permite exercitar `socket.io-client`. Decimal.js calcula os totais no mock e no carrinho. Playwright e Lighthouse verificam comportamentos e qualidade.

O uso de componentes locais é configurado por `components.json`. Os controles atuais usam elementos HTML nativos: essa estrutura não fornece automaticamente as garantias de foco de um Dialog/Drawer completo.

## Fluxo de dados

Nas funcionalidades integradas, a tela chama um adaptador Axios por meio de uma query/mutation; MSW recebe a requisição, consulta ou altera o estado simulado e responde. A tela consome o resultado por TanStack Query. Eventos passam pelo WebSocket interceptado, são decodificados como Socket.IO e chegam ao cliente antes de atualizar a interface ou invalidar consultas.

Há exceções ainda não conformes: itens e mutations do carrinho vivem em Zustand; o checkout possui endereço de carteira fictício de fallback; paginação e parte da filtragem são realizadas na UI. Esses caminhos precisam migrar para os contratos de rede exigidos.

## Rotas e URL

Públicas: `/`, `/nft/$nftId`, `/cart`, `/login`, `/register`. Privadas: `/checkout`, `/profile`, `/wallets`, `/favorites`, `/orders`. A confirmação é um modal no checkout, condicionado a `order.status === 'confirmed'`; não há rota de recibo por pedido.

O catálogo valida `search`, `category`, `network`, `minPrice`, `maxPrice`, `sort`, `tab` e `page` no Router. Mudanças de filtro reiniciam a página. A listagem envia os filtros e a ordenação por Axios, mas não envia `page`/tamanho: recebe os resultados e aplica `slice` no cliente. Isso ainda não atende ao contrato REST de paginação do enunciado.

Os guards verificam a presença de sessão armazenada e `AuthenticatedRoute` verifica o estado de autenticação. `returnTo` preserva o destino de entrada. A aplicação hospedada precisa de fallback de SPA para `/index.html` sem impedir o acesso a arquivos estáticos e ao worker MSW.

## Sessão e isolamento

`kurio.auth.session` armazena token, usuário público e expiração. Ao iniciar, a aplicação consulta `GET /api/auth/session`. Login/cadastro retornam uma sessão com validade simulada de 24 horas. Senhas de contas simuladas são persistidas como hash demonstrativo, nunca como senha em claro; o algoritmo não é uma implementação de autenticação de produção.

Logout remove a sessão local, cancela/remove queries privadas e de detalhe e desconecta Socket.IO; também solicita o logout à API. As chaves privadas incluem o usuário, e pedidos são filtrados pelo proprietário no mock.

Limitações verificadas:

- `activeUser()` verifica a existência da sessão, mas não sua expiração. Perfil e outras rotas privadas podem aceitar token expirado.
- A recuperação de sessão recria uma sessão a partir do token previsível quando o mapa em memória está vazio. Expiração e revogação não são preservadas corretamente após reload.
- Não há tratamento global de 401 que preserve o rascunho de checkout e solicite reautenticação durante a navegação.
- `setSession()` não limpa integralmente o cache da identidade anterior por si só; a limpeza depende do fluxo de logout.
- Carrinho e suas quantidades usam uma única chave local, compartilhada entre identidades no mesmo navegador. O isolamento completo entre usuários ainda não está garantido.

## Carrinho, valores e cotação

`kurio.cart.v2` persiste o carrinho Zustand. O estado inicial contém três itens de demonstração. Inclusão, remoção, cupom e quantidade são locais; autenticar mantém os itens por usar o mesmo estado. Não existe ainda um carrinho remoto por visitante/usuário nem merge autenticado pela API.

`POST /api/cart/quote` recebe identificador, edição e quantidade de cada item e cupom opcional. Consulta o catálogo, limita quantidade à disponibilidade do NFT, calcula subtotal/desconto/taxa/total com Decimal.js e retorna strings com 18 casas decimais. `KURIO10` concede 10%; a taxa simulada é `0.016` ETH para subtotal não nulo.

Os totais do servidor são a referência usada no envio do pedido. Entretanto, a disponibilidade é global por NFT, não por edição. A apresentação do checkout/recibo converte valores para `Number` e usa três casas; o carrinho mostra duas. É necessário padronizar cálculo e apresentação decimal sem perda de precisão.

## Checkout, idempotência e recibo

O checkout consulta perfil, carteiras, cotação e pedidos. Valida campos com Zod, simula conexão/recusa/desconexão de carteira e exige reconhecimento quando a cotação muda. Não há integração com extensão, blockchain ou gateway real.

Cada tentativa usa `kurio.checkout.attempt.<userId>` e envia `Idempotency-Key`. O mock busca a chave entre os pedidos do usuário: conteúdo igual recupera o pedido e conteúdo diferente retorna 409. O fingerprint atual inclui itens, cupom e dados do checkout; não inclui o objeto `quote`.

O servidor recalcula o total e verifica disponibilidade antes de criar um pedido `pending`, `confirmed` ou `declined`. Apenas confirmação abre o modal e remove quantidades compradas. Em falha de transporte, o cliente consulta pedidos para recuperar a tentativa. Estados terminais são protegidos contra regressão no componente.

O pedido persiste `receipt`, versão e referência simulada. O recibo de valores fica no pedido; imagens/nomes também são guardados em `kurio.checkout.receipt.<userId>.<orderId>`. Limitações:

- O mock compara o total enviado, mas guarda `body.quote` como recibo; ainda precisa gerar e validar o snapshot completo no servidor, incluindo edição, cupom, taxas e quantidades inteiras.
- O checkout sem carteira cadastrada usa endereço e tipo fictícios definidos na tela.
- O efeito de recuperação deixa de acompanhar REST depois de preencher `recoveredOrderId`; uma confirmação perdida durante desconexão pode deixar a UI pendente após reconexão.
- A confirmação automática de pendências usa timer em memória; reload antes de sua execução perde esse timer.
- `confirmOrder()` altera status/referência, mas não reproduz integralmente a baixa de estoque e os eventos de NFT da confirmação normal.
- A listagem de pedidos não oferece reabertura de recibo completo por identificador.

## Política de cache, retries e atualização otimista

| Recurso | Chave | Política |
| --- | --- | --- |
| Catálogo/facetas | `['public', recurso, filtros]` | staleTime padrão de 30 s; parâmetros compõem a chave |
| Detalhe | `['nft', nftId, userId ou 'anonymous']` | Separa o estado de favorito por usuário |
| Perfil/carteiras/favoritos | `['private', userId, recurso]` | Telas usam staleTime de 60 s quando configurado |
| Cotação | `['cart-quote', userId ou 'visitor', revisão]` | Revisão inclui itens/cupom; invalidação por evento; checkout usa `retry: false` |
| Pedidos | `['private', userId, 'orders']` | Checkout usa staleTime 0 e sem retry automático |

Queries repetem falhas de rede/5xx até duas vezes, com espera de 1 s e 2 s (limite de 4 s). Mutations não têm retry automático. O predicado depende do campo `error.status`; adaptadores que perdem esse campo podem fazer 4xx entrar no retry. `refetchOnWindowFocus` está desativado.

Catálogo, detalhe e cotação encaminham AbortSignal ao Axios. Nem todos os adaptadores privados recebem signal. Chaves por usuário reduzem mistura de respostas, mas o cancelamento precisa ser completado para consultas/mutations durante troca de sessão.

Favoritar usa atualização otimista do detalhe: cancela consulta, guarda snapshot, altera `isFavorite`, restaura snapshot em erro e invalida consultas ao concluir. Perfil/carteiras invalidam suas queries após salvar.

## REST: contratos efetivamente implementados

Base `/api`. Requisições/respostas JSON; recursos privados usam `Authorization: Bearer <token>`. As tipagens de transporte ficam nos adaptadores das funcionalidades; o mock ainda duplica alguns tipos.

| Método e caminho | Entrada | Saída/erros relevantes |
| --- | --- | --- |
| `POST /auth/register` | `name`, `email`, `password` | `{ session }`, 201; 400/409 |
| `POST /auth/login` | `email`, `password` | `{ session }`; 401 |
| `GET /auth/session` | Bearer; `expired=1` força falha | `{ session }`; 401 |
| `POST /auth/logout` | Bearer | 204 |
| `GET /nfts` | busca, categoria, rede, preços, ordenação | `{ items: Nft[] }`; sem paginação no servidor |
| `GET /nfts/:id` | identificador; Bearer opcional | `{ nft }`; 404; inclui favorito quando autenticado |
| `GET /favorites` | Bearer | `{ nfts }`; 401 |
| `POST /favorites/:nftId` | Bearer | `{ isFavorite: true }`; 401 |
| `DELETE /favorites/:nftId` | Bearer | `{ isFavorite: false }`; 401 |
| `POST /cart/coupons` | `{ code }` | `{ coupon: { code } }`; 410 para `EXPIRED`, 422 para inválido |
| `POST /cart/quote` | `{ items: [{ id, editionId, quantity }], coupon }` | `CartQuote`; 422 |
| `GET /profile` | Bearer | `{ profile }`; 401 |
| `PUT /profile` | dados, `walletAlias`, `avatar` opcional | `{ profile, user }`; 400/401 |
| `PUT /profile/password` | `currentPassword`, `password`, `confirmPassword` | `{ ok: true }`; 400/401 |
| `GET /wallets` | Bearer | `{ wallets }`; 401 |
| `PUT /wallets/:id` | carteira com endereço, rede e metadados | `{ wallet }`; cria ou atualiza; 400/401 |
| `POST /orders` | itens, cupom, cotação, dados de checkout; `Idempotency-Key` | `{ order }`, 201 ou pedido existente; 400/401/409 |
| `GET /orders` | Bearer | `{ orders }` do usuário; 401 |
| `GET /orders/:id` | Bearer | `{ order }`; 401/404 |

Erros usam `{ message, fieldErrors? }`. Não há envelope de código de erro padronizado. O cenário de falha permite 503 e erros de conexão. Não existe cenário específico de 403. O endpoint individual de pedido consulta o mapa em memória sem restaurá-lo por conta própria; a listagem restaura os registros persistidos.

Recursos ainda ausentes: consulta, inclusão, alteração e remoção de itens de carrinho via REST. A UI de carteiras oferece persistência da principal, mas não liga os botões da secundária ao endpoint.

Formato da cotação:

```ts
type CartQuote = {
  coupon: { code: string; discountEth: string } | null
  items: Array<{
    id: string; editionId: string; quantity: number
    availability: number; priceEth: string
  }>
  totals: {
    subtotalEth: string; discountEth: string
    networkFeeEth: string; totalEth: string
  }
}
```

## Socket.IO e reconciliação

O cliente usa namespace padrão, caminho `/realtime/socket.io`, transporte WebSocket e `autoConnect: false`. MSW intercepta a conexão e `toSocketIo()` trata o protocolo. Não é necessário servidor externo na demonstração.

| Evento | Payload |
| --- | --- |
| `session.identify` | `{ token }`, cliente → mock |
| `nft.updated` | `{ nftId, priceEth, availability, version, userId: null }` |
| `order.updated` | `{ orderId, userId, status, version, reason?, transactionReference? }` |

Identidade lógica: tipo + identificador do recurso + versão. O cliente valida payloads com Zod e descarta versões iguais/menores. Eventos privados só chegam aos assinantes da identidade ativa. Alterações de NFT invalidam catálogo, detalhe e cotação; alterações de pedido invalidam a lista privada. Ao conectar, são invalidados catálogo, cotação e queries privadas ativas.

Limitações atuais:

- Visitantes não conectam o socket; alterações de preço/estoque em seu carrinho não chegam por tempo real.
- A identificação usa `once('connect')`: reconexões não reenviam a identificação necessária ao mapa de sockets do mock.
- A reconciliação de `connect` não invalida as chaves de detalhe `['nft', ...]`.
- O mock não remove entradas de `socketUsers` ao desconectar. Há risco de retenção de listeners/referências.
- As versões de NFT vivem em memória e não acompanham a persistência do catálogo.
- Não estão implementados polling de fallback, rooms, namespaces customizados, acks ou payloads binários na simulação.

Os controles `updateNft` e `confirmOrder` alteram o mock; `emitNftUpdate`/`emitOrderUpdate` servem para injetar eventos antigos/duplicados e não atualizam o banco. Não devem substituir mutations REST nos fluxos de negócio.

## Persistência, cenários e reset

MSW guarda usuários, perfis, carteiras, favoritos, catálogo e pedidos em chaves `kurio.mock.*` no localStorage. Sessões, conexões, versões e timers ficam em memória. O ambiente é local ao navegador/origem; não há sincronização entre computadores ou abas como em um backend real.

`resetMockScenario()` remove as chaves do banco do mock e restaura o cenário `success`, mas não remove carrinho, sessão e tentativas de checkout. Para reset integral, use a receita de limpeza das chaves `kurio.*` e reload do README. Cenários configurados por console não sobrevivem ao reload; a variável de build define o cenário de partida.

Existe somente um usuário pré-carregado. Um segundo pode ser cadastrado pela UI; ainda falta a segunda fixture exigida. `variable-latency` atualmente aplica 300 ms fixos, portanto não exercita respostas fora de ordem. `order-timeout` cria pedido e devolve erro de rede imediatamente: testa perda de resposta, mas não um timeout real do Axios.

## UX, assets e acessibilidade

Os tokens e a composição pretendida estão em [docs/design/system.md](docs/design/system.md). Fontes Roboto Mono 400/500/700 são locais via `@fontsource`. Imagens e SVGs ficam em `src/assets`; variantes JPEG de `src/assets/optimized` substituem imagens PNG em partes do catálogo/detalhe para reduzir bytes. Essas conversões precisam de comparação visual antes da entrega.

Decisões existentes: formulários com labels; inputs, selects e radios nativos; foco visível; mensagens com `role="alert"`/`role="status"`; skeletons com shimmer e respeito a movimento reduzido no catálogo/detalhe/resumo. O login pode abrir em modal preservando a tela de origem.

Desvios e pendências: drawer de filtros e modal de confirmação não têm contenção completa de foco; erros de conta não são associados individualmente aos campos; informações/relacionados do detalhe são ocultados em mobile; ações de carrinho/favorito dos cards e carteira secundária estão inertes. Newsletter anuncia sucesso local sem operação correspondente; precisa indicar simulação/indisponibilidade. O recibo mostra nome de carteira fixo.

A consulta ao Figma durante esta auditoria foi negada por permissão. Não foi possível certificar equivalência visual. Ainda é necessário revisar todas as telas em 390, 768 e 1440 px, teclado, zoom e contraste.

## Verificação e entrega

O README reúne os comandos. Playwright preserva trace, vídeo e screenshot de falhas e gera relatório HTML. Baselines precisam ser revisadas e versionadas, com caminhos distintos por viewport/projeto; a configuração atual usa o mesmo nome de arquivo para ambos.

Lighthouse deve executar três medições para início/detalhe em mobile/desktop, no build otimizado com mocks e assets reais. `lighthouse/config.mjs` e `scripts/run-lighthouse.mjs` definem as 12 medições, relatórios HTML/JSON e medianas em `reports/lighthouse/summary.md`. A presença do script não comprova execução nem aprovação das metas.

O deploy público, seus deep links e a correspondência com o commit entregue ainda precisam de validação. Nenhuma integração privada é necessária para rodar os mocks. As falhas conhecidas e os limites das evidências estão no [relatório de entrega](docs/delivery-audit.md).
