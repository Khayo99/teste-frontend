import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {
  CatalogCategory,
  CatalogQuery,
  CatalogSearch,
  CatalogSort,
  CatalogTab
} from '@/@types/catalog'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CatalogFilters } from '@/features/catalog/components/catalog-filters'
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination'
import { FeaturedNftBanner } from '@/features/catalog/components/featured-nft-banner'
import { NftCard } from '@/features/catalog/components/nft-card'
import { getCatalogNfts } from '@/features/catalog/api/catalog-api'
import { filterCatalog } from '@/features/catalog/lib/filter-catalog'
import toolbarUnderline from '@/assets/catalog/toolbar-underline.svg'
import mobileArtworkOne from '@/assets/home/mobile-nft-01.png'
import mobileArtworkTwo from '@/assets/home/mobile-nft-02.png'
import mobileArtworkThree from '@/assets/home/mobile-nft-03.png'
import mobileArtworkFour from '@/assets/home/mobile-nft-04.png'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { queryKeys } from '@/lib/query-keys'

const pageSize = 9
const mobileArtwork = [
  mobileArtworkOne,
  mobileArtworkTwo,
  mobileArtworkThree,
  mobileArtworkFour
]

export function HomeCatalog() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const [isRetrying, setIsRetrying] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const openFilters = () => setFiltersOpen(true)
    window.addEventListener('kurio:open-catalog-filters', openFilters)
    return () =>
      window.removeEventListener('kurio:open-catalog-filters', openFilters)
  }, [])
  const query = useMemo<CatalogQuery>(
    () => ({
      category: search.category,
      maxPrice: search.maxPrice,
      minPrice: search.minPrice,
      network: search.network,
      search: search.search,
      sort: search.sort
    }),
    [search]
  )
  const currentPage = search.page
  const activeTab = search.tab
  const facetQuery = useMemo<CatalogQuery>(
    () => ({ ...query, category: null }),
    [query]
  )
  const {
    data: catalogNfts = [],
    isError,
    isLoading,
    refetch
  } = useQuery({
    queryKey: queryKeys.catalog(query),
    queryFn: ({ signal }) => getCatalogNfts(query, signal)
  })
  const { data: categoryFacetNfts = [] } = useQuery({
    queryKey: queryKeys.catalogFacets(facetQuery),
    queryFn: ({ signal }) => getCatalogNfts(facetQuery, signal),
    enabled: query.category !== null
  })
  const visibleNfts = useMemo(
    () => filterCatalog(catalogNfts, query),
    [catalogNfts, query]
  )
  const tabbedNfts = useMemo(() => {
    if (activeTab === 'all') return visibleNfts

    const sortedNfts = [...visibleNfts]
    if (activeTab === 'new') return sortedNfts.reverse()

    return sortedNfts.sort(
      (firstNft, secondNft) =>
        Number(secondNft.priceEth) - Number(firstNft.priceEth)
    )
  }, [activeTab, visibleNfts])
  const categoryCounts = useMemo(() => {
    const nftsForFacets =
      query.category === null ? catalogNfts : categoryFacetNfts

    return nftsForFacets.reduce<Record<CatalogCategory, number>>(
      (counts, nft) => {
        counts[nft.category] += 1
        return counts
      },
      {
        'Arte digital': 0,
        'Arte 3D': 0,
        Assinaturas: 0,
        Colecionáveis: 0,
        Fotografia: 0,
        Generativa: 0,
        Jogos: 0,
        Música: 0,
        Utilidade: 0
      }
    )
  }, [catalogNfts, categoryFacetNfts, query.category])
  const pageCount = Math.ceil(tabbedNfts.length / pageSize)
  const safeCurrentPage = Math.min(currentPage, Math.max(pageCount, 1))
  const paginatedNfts = tabbedNfts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  )
  const handleQueryChange = (nextQuery: CatalogQuery) => {
    void navigate({
      search: (previous: CatalogSearch) => ({
        ...previous,
        ...nextQuery,
        page: 1
      }),
      resetScroll: false
    })
  }
  const handleTabChange = (nextTab: CatalogTab) => {
    void navigate({
      search: (previous: CatalogSearch) => ({
        ...previous,
        tab: nextTab,
        page: 1
      }),
      resetScroll: false
    })
  }
  const handlePageChange = (page: number) =>
    void navigate({
      search: (previous: CatalogSearch) => ({ ...previous, page }),
      resetScroll: false
    })
  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await refetch()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <section className="mt-6 mb-12 flex gap-12 md:mt-0 md:mb-0" id="mercado">
      <div className="hidden w-catalog-sidebar-width shrink-0 flex-col gap-4 lg:flex">
        <CatalogFilters
          categoryCounts={categoryCounts}
          onChange={handleQueryChange}
          query={query}
        />
        <FeaturedNftBanner />
      </div>
      <div className="min-w-0 flex-1 xl:w-catalog-grid-width xl:flex-none">
        <div className="relative mb-6 mt-4 flex flex-col gap-4 text-body-15-medium sm:mb-8 sm:min-h-catalog-toolbar-height sm:flex-row sm:items-start sm:justify-between">
          <div
            className="relative -mx-1 flex max-w-full gap-4 overflow-x-auto px-1 pb-1"
            role="tablist"
            aria-label="Visualização do catálogo"
          >
            {[
              ['all', 'Todos os NFTs'],
              ['new', 'Novos lançamentos'],
              ['trending', 'Em alta']
            ].map(([tab, label]) => (
              <Button
                aria-selected={activeTab === tab}
                className={`relative shrink-0 whitespace-nowrap text-value-14 ${activeTab === tab ? 'text-text-accent' : 'text-foreground transition-colors hover:text-text-accent'} ${activeTab === tab && tab !== 'all' ? 'after:absolute after:left-0 after:top-value-23 after:h-0.5 after:w-full after:bg-text-accent' : ''}`}
                key={tab}
                onClick={() => handleTabChange(tab as CatalogTab)}
                role="tab"
                variant="ghost"
                type="button"
              >
                {label}
                {activeTab === tab && tab === 'all' ? (
                  <img
                    alt=""
                    className="absolute left-0 top-value-23"
                    src={toolbarUnderline}
                  />
                ) : null}
              </Button>
            ))}
          </div>
          <div className="hidden items-center justify-between gap-3 sm:flex sm:w-catalog-toolbar-sort-width sm:shrink-0">
            <Button
              aria-expanded={filtersOpen}
              className="h-9 gap-2 px-3 lg:hidden"
              onClick={() => setFiltersOpen(true)}
              type="button"
              variant="outline"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />{' '}
              Filtros
            </Button>
            <div className="relative h-value-18 min-w-0 flex-1 text-body-15 text-foreground">
              <label className="absolute left-0 top-0" htmlFor="catalog-sort">
                Ordenar por:
              </label>
              <Select
                className="absolute left-value-110 top-0 w-catalog-sort-input-width appearance-none truncate bg-transparent pl-0 pr-5 text-left text-foreground outline-none"
                id="catalog-sort"
                onChange={event =>
                  handleQueryChange({
                    ...query,
                    sort: event.target.value as CatalogSort
                  })
                }
                value={query.sort}
              >
                <option className="bg-surface-card" value="recent">
                  Listados recentemente
                </option>
                <option className="bg-surface-card" value="price-asc">
                  Menor preço
                </option>
                <option className="bg-surface-card" value="price-desc">
                  Maior preço
                </option>
              </Select>
              <span className="pointer-events-none absolute right-0 top-value-2 flex size-4 items-center justify-center">
                <ChevronDown aria-hidden="true" size={11} strokeWidth={1.5} />
              </span>
            </div>
          </div>
        </div>
        {isLoading && !isRetrying ? (
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
            aria-label="Carregando NFTs"
            role="status"
          >
            {Array.from({ length: 9 }, (_, index) => (
              <div
                className="skeleton h-value-200 rounded-2xl sm:h-card-visual-height"
                key={index}
              />
            ))}
          </div>
        ) : isError || isRetrying ? (
          <div className="py-16 text-center text-text-secondary">
            <p aria-live="polite">
              {isRetrying
                ? 'Tentando carregar os NFTs novamente...'
                : 'Não foi possível carregar os NFTs.'}
            </p>
            <Button
              className="mt-4 rounded-md bg-primary px-4 py-2 text-ink"
              disabled={isRetrying}
              onClick={() => void handleRetry()}
              type="button"
              variant="primary"
            >
              {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
            </Button>
          </div>
        ) : tabbedNfts.length > 0 ? (
          <div className="home-catalog-grid grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-catalog-row-gap lg:grid-cols-catalog lg:justify-between">
            {paginatedNfts.map((nft, index) => (
              <NftCard
                key={nft.id}
                mobileImage={mobileArtwork[index % mobileArtwork.length]}
                nft={nft}
              />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-text-secondary">
            Nenhum NFT encontrado para os filtros selecionados.
          </p>
        )}

        <div className="w-full flex justify-end">
          <CatalogPagination
            currentPage={safeCurrentPage}
            onPageChange={handlePageChange}
            pageCount={pageCount}
          />
        </div>
      </div>
      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-4 lg:hidden"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setFiltersOpen(false)
          }}
        >
          <aside
            aria-label="Filtros do catálogo"
            aria-modal="true"
            className="ml-auto h-full max-w-value-310 overflow-y-auto bg-surface-card shadow-2xl"
            role="dialog"
          >
            <div className="flex justify-end p-3">
              <Button
                aria-label="Fechar filtros"
                className="size-9 p-0"
                onClick={() => setFiltersOpen(false)}
                type="button"
                variant="ghost"
              >
                <X className="size-5" />
              </Button>
            </div>
            <CatalogFilters
              categoryCounts={categoryCounts}
              onChange={handleQueryChange}
              query={query}
            />
          </aside>
        </div>
      )}
    </section>
  )
}
