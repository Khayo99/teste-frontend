import type { CatalogQuery, CatalogSearch } from '@/@types/catalog'

/** One place for key ownership. Never put a token in a cache key. */
export const queryKeys = {
  catalog: (search: CatalogQuery | CatalogSearch) =>
    ['public', 'catalog', search] as const,
  catalogFacets: (search: CatalogQuery | CatalogSearch) =>
    ['public', 'catalog-facets', search] as const,
  nft: (nftId: string, userId: string | null) =>
    ['nft', nftId, userId ?? 'anonymous'] as const,
  profile: (userId: string) => ['private', userId, 'profile'] as const,
  wallets: (userId: string) => ['private', userId, 'wallets'] as const,
  favorites: (userId: string) => ['private', userId, 'favorites'] as const,
  cart: (userId: string | null) => ['cart', userId ?? 'visitor'] as const,
  quote: (userId: string | null, revision: string) =>
    ['cart-quote', userId ?? 'visitor', revision] as const,
  orders: (userId: string) => ['private', userId, 'orders'] as const,
  order: (userId: string, orderId: string) =>
    ['private', userId, 'orders', orderId] as const
}
