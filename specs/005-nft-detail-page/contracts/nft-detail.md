# NFT Detail Interface Contract

## Get NFT detail

`GET /api/nfts/:id`

| Path parameter | Required | Meaning |
|---|---:|---|
| id | Yes | Identificador estável do NFT |

Headers opcionais: `Authorization: Bearer <token>` — quando presente e válido, a resposta inclui
`isFavorite` refletindo o estado do usuário autenticado.

A resposta retorna um objeto `NftDetail` (ver `data-model.md`), incluindo `reviews`, `reviewsList` e
`relatedNfts`. Identificador inexistente retorna erro 404 com `{ message }`; a tela trata esse caso
exibindo estado "NFT não encontrado" com link de volta ao catálogo (mantendo header/footer do layout
global).

## Favorite an NFT

`POST /api/favorites/:nftId`

Requer `Authorization: Bearer <token>` válido. Resposta `{ isFavorite: true }`. Sem token válido,
retorna 401 com `{ message }`; a UI redireciona para `/login?returnTo=/nft/:nftId`.

## Unfavorite an NFT

`DELETE /api/favorites/:nftId`

Requer `Authorization: Bearer <token>` válido. Resposta `{ isFavorite: false }`. Mesmas regras de 401
do endpoint de favoritar.

## Error shape

Todos os erros desta interface seguem `{ message: string }`, consistente com o padrão já usado em
`auth-api.ts`/`catalog-api.ts`.
