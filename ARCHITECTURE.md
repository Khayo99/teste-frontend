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
