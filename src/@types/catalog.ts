export type CatalogCategory =
  | 'Arte digital'
  | 'Fotografia'
  | 'Música'
  | 'Arte 3D'
  | 'Colecionáveis'
  | 'Generativa'
  | 'Jogos'
  | 'Assinaturas'
  | 'Utilidade'

export type CatalogNetwork = 'Ethereum' | 'Polygon' | 'Solana'

export type CatalogSort = 'recent' | 'price-asc' | 'price-desc'

export type Nft = {
  availability: number
  category: CatalogCategory
  id: string
  image: string
  name: string
  network: CatalogNetwork
  priceEth: string
  rarity?: 'Raro'
  tokenId: string
}

export type CatalogQuery = {
  category: CatalogCategory | null
  maxPrice: number
  minPrice: number
  network: CatalogNetwork | null
  search: string
  sort: CatalogSort
}

export type CatalogTab = 'all' | 'new' | 'trending'

export type CatalogSearch = CatalogQuery & {
  page: number
  tab: CatalogTab
}

export type CatalogFiltersProps = {
  categoryCounts: Record<CatalogCategory, number>
  onChange: (query: CatalogQuery) => void
  query: CatalogQuery
}

export type NftCardProps = {
  nft: Nft
}
