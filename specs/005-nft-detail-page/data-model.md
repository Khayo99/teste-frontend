# Data Model: Detalhes do NFT

## NftDetail

Estende `Nft` (catálogo) com os campos necessários para a tela de detalhe.

| Field | Rule |
|---|---|
| id | Stable, non-empty identifier (igual ao catálogo) |
| name | Non-empty display title |
| tokenId | Non-empty edition identifier |
| priceEth | Decimal string exibido com ETH |
| image | Local asset path (imagem principal) |
| gallery | Lista não vazia de caminhos de imagem (inclui `image` como primeiro item) |
| category | Supported catalog category |
| network | Ethereum, Polygon ou Solana |
| availability | Non-negative integer; 0 significa indisponível para compra/favoritar |
| editionLabel | Rótulo de edição exibido (`1/1`, `1/10`, `1/50`, `ABERTA`) |
| rarity | Optional visual badge |
| description | Texto não vazio descrevendo o NFT |
| attributes | Lista de pares `{ trait, value }`, pode ser vazia |
| collection | `{ name, id }` da coleção à qual o NFT pertence |
| contractAddress | Endereço de contrato não vazio |
| copyright | Texto de direitos autorais não vazio |
| reviews | `{ average, count }`; `average` entre 0 e 5, `count` não-negativo |
| relatedNfts | Lista de `RelatedNft` (pode ser vazia) |
| isFavorite | Presente apenas quando a requisição é autenticada; booleano |

## CollectorReview

| Field | Rule |
|---|---|
| id | Stable, non-empty identifier |
| authorName | Non-empty |
| rating | Inteiro entre 1 e 5 |
| comment | Texto não vazio |
| createdAt | Data ISO 8601 |

Observação: nesta entrega, avaliações são somente leitura — não há endpoint de criação/edição pela
pessoa usuária (ver Assumption no spec). `CollectorReview` é consumida como lista dentro de
`NftDetail.reviewsList` para a aba "Avaliações".

## Favorite

| Field | Rule |
|---|---|
| userId | Stable, non-empty identifier (do usuário autenticado) |
| nftId | Stable, non-empty identifier (do NFT) |
| createdAt | Data ISO 8601 de quando o favorito foi marcado |

Representa a associação usuário ↔ NFT; é criada/removida pelos endpoints de favorito e não é exposta
diretamente como lista na UI desta entrega — apenas o booleano `NftDetail.isFavorite` é consumido.

## RelatedNft

| Field | Rule |
|---|---|
| id | Stable, non-empty identifier |
| name | Non-empty display title |
| priceEth | Decimal string exibido com ETH |
| image | Local asset path |

Subconjunto leve de `NftDetail`, usado apenas no carrossel "Mais desta coleção"; ao clicar, navega
para `/nft/$nftId` do item relacionado.

## NftDetailQuantity (estado de UI, não persistido)

| Field | Rule |
|---|---|
| quantity | Inteiro positivo, limitado por `min(availability, limite superior razoável)` |

Validado por `clampQuantity(quantity, availability)` em `nft-detail-validation.ts`: nunca permite
quantidade maior que `availability` nem menor que 1; quando `availability` é 0, a UI desabilita o
seletor e os botões de ação em vez de permitir quantidade 0.
