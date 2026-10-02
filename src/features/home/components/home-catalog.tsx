import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CatalogCategory, CatalogQuery, CatalogSort } from '@/@types/catalog'
import { CatalogFilters } from '@/features/catalog/components/catalog-filters'
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination'
import { FeaturedNftBanner } from '@/features/catalog/components/featured-nft-banner'
import { NftCard } from '@/features/catalog/components/nft-card'
import { getCatalogNfts } from '@/features/catalog/api/catalog-api'
import { filterCatalog } from '@/features/catalog/lib/filter-catalog'

const initialQuery: CatalogQuery = { category: null, maxPrice: 12.3, minPrice: 0.02, network: null, search: '', sort: 'recent' }
const pageSize = 9

export function HomeCatalog() {
  const [query, setQuery] = useState<CatalogQuery>(initialQuery)
  const [currentPage, setCurrentPage] = useState(1)
  const { data: catalogNfts = [], isError, isLoading, refetch } = useQuery({ queryKey: ['catalog-nfts'], queryFn: getCatalogNfts })
  const visibleNfts = useMemo(() => filterCatalog(catalogNfts, query), [catalogNfts, query])
  const categoryCounts = useMemo(() => {
    const queryWithoutCategory = { ...query, category: null }
    const nftsForFacets = filterCatalog(catalogNfts, queryWithoutCategory)

    return nftsForFacets.reduce<Record<CatalogCategory, number>>((counts, nft) => {
      counts[nft.category] += 1
      return counts
    }, {
      'Arte digital': 0,
      'Arte 3D': 0,
      'Assinaturas': 0,
      'Colecionáveis': 0,
      'Fotografia': 0,
      'Generativa': 0,
      'Jogos': 0,
      'Música': 0,
      'Utilidade': 0,
    })
  }, [catalogNfts, query])
  const pageCount = Math.ceil(visibleNfts.length / pageSize)
  const paginatedNfts = visibleNfts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const handleQueryChange = (nextQuery: CatalogQuery) => {
    setQuery(nextQuery)
    setCurrentPage(1)
  }

  return (
    <section className="flex gap-12" id="mercado">
      <div className="hidden w-catalog-sidebar-width shrink-0 flex-col gap-4 lg:flex">
        <CatalogFilters categoryCounts={categoryCounts} onChange={handleQueryChange} query={query} />
        <FeaturedNftBanner />
      </div>
      <div className="min-w-0 flex-1 xl:w-catalog-grid-width xl:flex-none">
        <div className="mb-8 flex h-catalog-toolbar-height flex-col justify-between gap-4 text-body-15-medium sm:flex-row sm:items-start">
          <div className="flex gap-5" role="tablist" aria-label="Visualização do catálogo">
            <button aria-selected="true" className="relative text-text-primary after:absolute after:inset-x-0 after:-bottom-tab-underline-offset after:h-px after:bg-text-accent" role="tab" type="button">Todos os NFTs</button>
            <button aria-selected="false" className="text-text-secondary transition-colors hover:text-text-primary" role="tab" type="button">Novos lançamentos</button>
            <button aria-selected="false" className="text-text-secondary transition-colors hover:text-text-primary" role="tab" type="button">Em alta</button>
          </div>
          <div className="flex items-center text-body-15 text-text-secondary">
            <label htmlFor="catalog-sort">Ordenar por:</label>
            <select className="w-catalog-sort-width appearance-none bg-transparent pl-px text-right text-text-primary" id="catalog-sort" onChange={(event) => handleQueryChange({ ...query, sort: event.target.value as CatalogSort })} value={query.sort}>
              <option className="bg-surface-card" value="recent">Listados recentemente</option>
              <option className="bg-surface-card" value="price-asc">Menor preço</option>
              <option className="bg-surface-card" value="price-desc">Maior preço</option>
            </select>
          </div>
        </div>
        {isLoading ? <div className="grid grid-cols-3 gap-8" aria-label="Carregando NFTs">{Array.from({ length: 9 }, (_, index) => <div className="h-card-visual-height animate-pulse rounded-2xl bg-surface-card" key={index} />)}</div>
          : isError ? <div className="py-16 text-center text-text-secondary"><p>Não foi possível carregar os NFTs.</p><button className="mt-4 rounded-md bg-primary px-4 py-2 text-ink" onClick={() => void refetch()} type="button">Tentar novamente</button></div>
          : visibleNfts.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-catalog-row-gap sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-catalog lg:justify-between">
            {paginatedNfts.map((nft) => <NftCard key={nft.id} nft={nft} />)}
          </div>
        ) : <p className="py-16 text-center text-text-secondary">Nenhum NFT encontrado para os filtros selecionados.</p>}
        <CatalogPagination currentPage={currentPage} onPageChange={setCurrentPage} pageCount={pageCount} />
      </div>
    </section>
  )
}
