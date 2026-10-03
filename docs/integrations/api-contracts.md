# Contratos REST em uso

Todos os recursos passam por `src/lib/api.ts`; os adaptadores retornam dados TypeScript e convertem erros Axios em erros de domínio.

| Recurso | Operação | Resposta principal |
| --- | --- | --- |
| Catálogo | `GET /api/nfts` | `{ items: Nft[] }` |
| Detalhe | `GET /api/nfts/:id` | `{ nft: NftDetail }` |
| Favoritos | `GET /api/favorites`, `POST/DELETE /api/favorites/:id` | `{ nfts }`, `{ isFavorite }` |
| Cotação | `POST /api/cart/quote` | itens confirmados e totais em strings ETH |
| Sessão | `POST /auth/login`, `POST /auth/register`, `GET /auth/session` | `{ session }` |
| Conta | perfil e carteiras | recursos autenticados por Bearer token |

Erros usam `{ message, fieldErrors? }`. `nft.updated` carrega `nftId`, `version`, `priceEth` e `availability`; versões antigas ou repetidas são descartadas.
