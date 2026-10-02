# Catalog Interface Contract

## List catalog

`GET /api/nfts`

| Query parameter | Required | Meaning |
|---|---:|---|
| search | No | Text matched against NFT name and token identifier |
| category | No | Selected collection category |
| network | No | Selected blockchain network |
| minPriceEth | No | Inclusive minimum ETH decimal string |
| maxPriceEth | No | Inclusive maximum ETH decimal string |
| sort | No | `recent`, `price-asc` or `price-desc` |
| page | Yes | One-based current page |
| pageSize | Yes | Number of records per page |

The response returns `items`, `total`, `page` and `pageSize`. Invalid values return field-level
validation errors; scenario selection can return a recoverable failure.
