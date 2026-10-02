import type { CatalogQuery, Nft } from '@/@types/catalog'

export function filterCatalog(nfts: Nft[], query: CatalogQuery) {
  const normalizedSearch = query.search.trim().toLocaleLowerCase('pt-BR')

  const filteredNfts = nfts.filter(nft => {
    const price = Number(nft.priceEth)
    const matchesSearch =
      normalizedSearch.length === 0 ||
      `${nft.name} ${nft.tokenId}`
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedSearch)

    const matchesCategory =
      query.category === null || nft.category === query.category

    const matchesNetwork =
      query.network === null || nft.network === query.network

    const matchesPrice = price >= query.minPrice && price <= query.maxPrice

    return matchesSearch && matchesCategory && matchesNetwork && matchesPrice
  })

  return [...filteredNfts].sort((firstNft, secondNft) => {
    if (query.sort === 'price-asc')
      return Number(firstNft.priceEth) - Number(secondNft.priceEth)

    if (query.sort === 'price-desc')
      return Number(secondNft.priceEth) - Number(firstNft.priceEth)

    return 0
  })
}
