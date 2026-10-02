# Arquitetura e conformidade da stack

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

O `AbortSignal` do TanStack Query chega ao Axios para descartar respostas obsoletas. O favorito usa atualização otimista com snapshot e rollback. Eventos `nft.updated` são validados, deduplicados pela versão e invalidam catálogo, detalhe e cotação; após reconexão os recursos ativos são revalidados por REST. O mock atual não cria um servidor Socket.IO real: em demonstração os eventos podem ser emitidos por um servidor compatível externo, enquanto a aplicação exercita sempre `socket.io-client`.

## Autenticação (004-auth-login-register)

`src/features/auth` concentra validação Zod, telas e adaptadores Axios. MSW simula cadastro, login, sessão e logout; o token é opaco e a senha nunca entra em localStorage. Zustand mantém a sessão e TanStack Query permite limpar dados privados no logout. O cliente Socket.IO é desconectado antes da troca de usuário. Guards do TanStack Router preservam a rota solicitada. Os nós Figma informados não estavam disponíveis para extração nesta sessão; a composição usa os tokens/assets já versionados e é responsiva nos breakpoints do projeto.
