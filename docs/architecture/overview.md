# Arquitetura e conformidade da stack

> Consulte [ARCHITECTURE.md](../../ARCHITECTURE.md) para o estado atual, contratos completos e limitações verificadas. Esta página preserva notas históricas de implementação.

## Regra de uso efetivo

Uma dependência obrigatória não pode permanecer apenas no `package.json`, em um arquivo de configuração ou em um provider sem consumidores. Toda mudança deve indicar o ponto de uso, a verificação e a responsabilidade da biblioteca.

| Tecnologia | Responsabilidade e uso atual | Verificação |
| --- | --- | --- |
| shadcn/ui | `Button` em `src/components/ui/button.tsx`, usado pela paginação | Testes de paginação |
| Axios | Cliente `src/lib/api.ts` usado por `getCatalogNfts` | MSW intercepta `GET /api/nfts` |
| TanStack Query | `useQuery` em `HomeCatalog` para carregamento, erro e retry | Skeleton e retry visíveis |
| MSW | Worker habilitado por padrão, handlers em `src/mocks/handlers.ts` | Desenvolvimento e Playwright |
| Socket.IO | Cliente compartilhado em `src/lib/realtime.ts` | Base para subscriptions de recursos |
| Playwright | Fluxos de catálogo, filtros, paginação e footer | `npm run test:e2e` |
| Lighthouse | Auditoria local de preview | `npm run lighthouse` |

## Gate de revisão

Antes de concluir uma feature, validar que novos dados passam por Axios, são interceptados por MSW, são consumidos com TanStack Query e possuem cobertura Playwright. Componentes de interface reutilizáveis devem usar ou estender `src/components/ui/`.

## Cache, falhas e sincronização

As chaves em `src/lib/query-keys.ts` carregam o usuário e os parâmetros já validados; tokens nunca entram em chaves. Catálogo tem `staleTime` de 30 segundos, dados privados de perfil/carteira/favoritos de 60 segundos e cotações são imediatamente obsoletas após alterações. Queries repetem apenas falhas de rede/5xx (duas tentativas com backoff); mutations não têm repetição automática.

O `AbortSignal` do TanStack Query chega ao Axios nas consultas de catálogo, detalhe e cotação. O favorito usa atualização otimista com snapshot e rollback. Eventos `nft.updated` são validados, deduplicados pela versão e invalidam catálogo, detalhe e cotação. MSW intercepta WebSocket com `@mswjs/socket.io-binding`, exercitando `socket.io-client` sem servidor externo. A reconciliação após reconexão ainda tem limitações descritas no documento consolidado.

## Autenticação (004-auth-login-register)

`src/features/auth` concentra validação Zod, telas e adaptadores Axios. MSW simula cadastro, login, sessão e logout; o token é opaco e a senha nunca entra em localStorage. Zustand mantém a sessão e TanStack Query permite limpar dados privados no logout. O cliente Socket.IO é desconectado antes da troca de usuário. Guards do TanStack Router preservam a rota solicitada. Os nós Figma informados não estavam disponíveis para extração nesta sessão; a composição usa os tokens/assets já versionados e é responsiva nos breakpoints do projeto.

## Pagamento (006-payment-checkout)

`src/features/orders/checkout-page.tsx` concentra o checkout protegido. Perfil e carteiras são buscados pelos adaptadores Axios existentes e a cotação é recuperada pelo endpoint do carrinho com TanStack Query. A confirmação exige campos válidos, conexão simulada da carteira e reconhecimento explícito da cotação atual; qualquer mudança material invalida esse reconhecimento. O cabeçalho `Idempotency-Key` e a tentativa persistida por usuário permitem recuperar a mesma operação após refresh.

Os handlers MSW validam dados de checkout, isolam pedidos pelo usuário da sessão, preservam o recibo decimal e retornam uma referência de transação simulada somente quando confirmado. Eventos de pedido carregam versão e referência; o componente descarta eventos que não pertencem ao usuário atual.

Proveniência visual: `emerald-ape.png`, `violet-nomad.png` e `ivory-baron.png` são os assets locais usados nas três linhas do recibo, em correspondência com o frame de pagamento do Figma. Os controles de carteira usam rádio nativo estilizado para preservar teclado e foco; eles substituem apenas vetores decorativos indisponíveis localmente.
