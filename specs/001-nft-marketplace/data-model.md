# Data Model: NFT Marketplace Home

## NFT

| Field | Rule |
|---|---|
| id | Stable, non-empty identifier |
| name | Non-empty display title |
| tokenId | Non-empty edition identifier |
| priceEth | Decimal string displayed with ETH |
| image | Local asset path |
| category | Supported catalog category |
| network | Ethereum, Polygon or Solana |
| availability | Non-negative integer |
| rarity | Optional visual badge |

## CatalogQuery

| Field | Rule |
|---|---|
| search | Trimmed text; empty means no text filter |
| category | Optional category selection |
| network | Optional network selection |
| minPriceEth | Optional non-negative decimal string |
| maxPriceEth | Optional decimal string not lower than minimum |
| sort | Recently listed, price ascending or price descending |
| page | Positive integer |
| pageSize | Positive integer |

## CatalogResponse

CatalogResponse returns `items`, `total`, `page` and `pageSize`. One response contains many NFTs and
is selected by one CatalogQuery.
