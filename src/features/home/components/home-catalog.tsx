import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {
  CatalogCategory,
  CatalogQuery,
  CatalogSort
} from '@/@types/catalog'
import { CatalogFilters } from '@/features/catalog/components/catalog-filters'
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination'
import { FeaturedNftBanner } from '@/features/catalog/components/featured-nft-banner'
import { NftCard } from '@/features/catalog/components/nft-card'
import { getCatalogNfts } from '@/features/catalog/api/catalog-api'
import { filterCatalog } from '@/features/catalog/lib/filter-catalog'
import toolbarUnderline from '@/assets/catalog/toolbar-underline.svg'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const initialQuery: CatalogQuery = {
  category: null,
  maxPrice: 12.3,
  minPrice: 0.02,
  network: null,
  search: '',
  sort: 'recent'
}
const pageSize = 9
type CatalogTab = 'all' | 'new' | 'trending'

export function HomeCatalog() {
  const [query, setQuery] = useState<CatalogQuery>(initialQuery)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<CatalogTab>('all')
  const [isRetrying, setIsRetrying] = useState(false)
  const {
    data: catalogNfts = [],
    isError,
    isLoading,
    refetch
  } = useQuery({ queryKey: ['catalog-nfts'], queryFn: getCatalogNfts })
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
    const queryWithoutCategory = { ...query, category: null }
    const nftsForFacets = filterCatalog(catalogNfts, queryWithoutCategory)

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
  }, [catalogNfts, query])
  const pageCount = Math.ceil(tabbedNfts.length / pageSize)
  const paginatedNfts = tabbedNfts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  const handleQueryChange = (nextQuery: CatalogQuery) => {
    setQuery(nextQuery)
    setCurrentPage(1)
  }
  const handleTabChange = (nextTab: CatalogTab) => {
    setActiveTab(nextTab)
    setCurrentPage(1)
  }
  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await refetch()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <section className="flex gap-12" id="mercado">
      <div className="hidden w-catalog-sidebar-width shrink-0 flex-col gap-4 lg:flex">
        <CatalogFilters
          categoryCounts={categoryCounts}
          onChange={handleQueryChange}
          query={query}
        />
        <FeaturedNftBanner />
      </div>
      <div className="min-w-0 flex-1 xl:w-catalog-grid-width xl:flex-none">
        <div className="relative mb-8 flex h-catalog-toolbar-height flex-col justify-between gap-4 text-body-15-medium sm:flex-row sm:items-start">
          <div
            className="relative flex gap-5"
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
                className={`relative whitespace-nowrap ${activeTab === tab ? 'text-text-accent' : 'text-foreground transition-colors hover:text-text-accent'} ${activeTab === tab && tab !== 'all' ? 'after:absolute after:left-0 after:top-[23px] after:h-0.5 after:w-full after:bg-text-accent' : ''}`}
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
                    className="absolute left-0 top-[23px]"
                    src={toolbarUnderline}
                  />
                ) : null}
              </Button>
            ))}
          </div>
          <div className="relative h-[18px] w-[300px] shrink-0 text-body-15 text-foreground">
            <label className="absolute left-0 top-0" htmlFor="catalog-sort">
              Ordenar por:
            </label>
            <Select
              className="absolute left-[110px] top-0 w-[190px] appearance-none truncate bg-transparent pl-0 pr-5 text-left text-foreground outline-none"
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
            <span className="pointer-events-none absolute left-[278px] top-[2px] flex size-4 items-center justify-center">
              <ChevronDown aria-hidden="true" size={11} strokeWidth={1.5} />
            </span>
          </div>
        </div>
        {isLoading && !isRetrying ? (
          <div className="grid grid-cols-3 gap-8" aria-label="Carregando NFTs">
            {Array.from({ length: 9 }, (_, index) => (
              <div
                className="h-card-visual-height animate-pulse rounded-2xl bg-surface-card"
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
        ) : visibleNfts.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-catalog-row-gap sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-catalog lg:justify-between">
            {paginatedNfts.map(nft => (
              <NftCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-text-secondary">
            Nenhum NFT encontrado para os filtros selecionados.
          </p>
        )}

        <div className="w-full flex justify-end">
          <CatalogPagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageCount={pageCount}
          />
        </div>
      </div>
    </section>
  )
}
