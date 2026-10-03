import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { getNftDetail } from '@/features/nft-detail/api/nft-detail-api'
import { useAuthStore } from '@/features/auth/auth-store'
import { NftGallery } from '@/features/nft-detail/components/nft-gallery'
import { NftPurchasePanel } from '@/features/nft-detail/components/nft-purchase-panel'
import { NftInfoTabs } from '@/features/nft-detail/components/nft-info-tabs'
import { RelatedNftsCarousel } from '@/features/nft-detail/components/related-nfts-carousel'
import { queryKeys } from '@/lib/query-keys'

export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { token, user } = useAuthStore()
  const {
    data: nft,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.nft(nftId, user?.id ?? null),
    queryFn: ({ signal }) => getNftDetail(nftId, token, signal)
  })

  if (isLoading) {
    return <NftDetailSkeleton />
  }

  const notFound = isError && (error as { status?: number }).status === 404

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-heading text-text-primary">NFT não encontrado</p>
        <p className="text-body-14-compact text-text-secondary">
          O NFT que você procura não existe ou foi removido.
        </p>
        <Link
          className="mt-2 rounded-md bg-primary px-5 py-3 text-body-16-bold-compact text-ink"
          to="/"
        >
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  if (isError || !nft) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p
          className="text-body-14-compact text-text-secondary"
          aria-live="polite"
        >
          Não foi possível carregar este NFT.
        </p>
        <button
          className="rounded-md bg-primary px-5 py-3 text-body-16-bold-compact text-ink"
          onClick={() => void refetch()}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-16 md:gap-16">
      <div className="flex flex-col gap-7 md:gap-7">
        <nav
          aria-label="Trilha de navegação"
          className="hidden text-body-15 text-text-secondary md:block"
        >
          <Link className="hover:text-text-primary" to="/">
            Início
          </Link>{' '}
          / Mercado
        </nav>
        <div className="grid grid-cols-1 gap-0 md:gap-12 lg:grid-cols-2">
          <NftGallery
            gallery={nft.gallery}
            name={`${nft.name} ${nft.tokenId}`}
          />
          <NftPurchasePanel key={nft.id} nft={nft} />
        </div>
      </div>
      <div className="hidden md:block">
        <NftInfoTabs nft={nft} />
      </div>
      <div className="hidden md:block">
        <RelatedNftsCarousel relatedNfts={nft.relatedNfts} />
      </div>
    </div>
  )
}

function NftDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando NFT" role="status">
      <span className="sr-only">Carregando NFT</span>

      <div className="md:hidden">
        <section className="relative -mb-value-114 h-value-506 overflow-hidden bg-nft-gallery-mobile">
          <div className="mx-auto flex w-nft-gallery-mobile-width flex-col gap-2 pt-value-23">
            <div className="skeleton size-value-35 rounded-full" />
            <div className="skeleton h-value-356 rounded-value-24" />
          </div>
          <div className="skeleton absolute left-1/2 top-value-365 h-value-7 w-value-56 -translate-x-1/2 rounded-full" />
        </section>
        <section className="relative z-10 flex min-h-value-504 flex-col gap-5 rounded-t-value-31 bg-surface-card px-6 pb-44 pt-8">
          <div className="flex items-center justify-between gap-3">
            <div className="skeleton h-5 w-3/5 rounded" />
            <div className="skeleton h-7 w-value-80 rounded-full" />
          </div>
          <div className="space-y-2"><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-4 w-4/5 rounded" /><div className="skeleton h-4 w-2/3 rounded" /></div>
          <div className="space-y-2"><div className="skeleton h-4 w-16 rounded" /><div className="flex gap-3"><div className="skeleton h-7 w-9 rounded-full" /><div className="skeleton h-7 w-value-42 rounded-full" /><div className="skeleton h-7 w-value-46 rounded-full" /></div></div>
          <div className="space-y-3"><div className="skeleton h-4 w-2/5 rounded" /><div className="skeleton h-4 w-3/5 rounded" /><div className="skeleton h-4 w-4/5 rounded" /></div>
        </section>
        <div className="fixed inset-x-0 bottom-0 z-30 rounded-t-value-40 bg-surface-card px-6 pb-9 pt-5 shadow-design"><div className="flex items-center justify-between"><div className="skeleton h-value-30 w-value-100 rounded" /><div className="skeleton h-5 w-value-100 rounded" /></div><div className="skeleton mt-5 h-value-60 w-value-196 rounded-value-40" /></div>
      </div>

      <div className="hidden flex-col gap-16 md:flex">
        <div className="flex flex-col gap-7">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="flex flex-row-reverse gap-4">
              <div className="skeleton aspect-square flex-1 rounded-2xl" />
              <div className="flex w-value-100 shrink-0 flex-col gap-4"><div className="skeleton size-value-100 rounded-2xl" /><div className="skeleton size-value-100 rounded-2xl" /><div className="skeleton size-value-100 rounded-2xl" /></div>
            </div>
            <div className="flex min-h-[430px] flex-col gap-8"><div><div className="skeleton h-9 w-2/3 rounded" /><div className="mt-2 flex gap-3 border-b border-border pb-3"><div className="skeleton h-5 w-24 rounded" /><div className="skeleton h-5 flex-1 rounded" /></div></div><div className="space-y-2"><div className="skeleton h-4 w-28 rounded" /><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-4 w-4/5 rounded" /></div><div className="space-y-2"><div className="skeleton h-4 w-16 rounded" /><div className="flex gap-2"><div className="skeleton h-7 w-9 rounded-full" /><div className="skeleton h-7 w-value-42 rounded-full" /><div className="skeleton h-7 w-value-46 rounded-full" /></div></div><div className="flex justify-between"><div className="skeleton h-value-49-5 w-value-130 rounded-value-33" /><div className="flex gap-2"><div className="skeleton h-10 w-value-130 rounded" /><div className="skeleton h-10 w-value-130 rounded" /></div></div><div className="space-y-3"><div className="skeleton h-4 w-2/5 rounded" /><div className="skeleton h-4 w-3/5 rounded" /><div className="skeleton h-4 w-4/5 rounded" /></div></div>
          </div>
        </div>
        <section className="flex flex-col gap-7 border-t border-border pt-7">
          <div className="flex gap-8 border-b border-border pb-5"><div className="skeleton h-5 w-28 rounded" /><div className="skeleton h-5 w-56 rounded" /></div>
          <div className="space-y-4"><div className="skeleton h-5 w-full rounded" /><div className="skeleton h-5 w-11/12 rounded" /><div className="skeleton h-5 w-4/5 rounded" /><div className="skeleton h-5 w-2/3 rounded" /></div>
        </section>
        <section className="flex flex-col gap-7 border-t border-border pt-7">
          <div className="skeleton h-5 w-44 rounded" />
          <div className="flex gap-6 overflow-hidden">{Array.from({ length: 4 }, (_, index) => <div className="w-value-219 shrink-0" key={index}><div className="skeleton aspect-square rounded-2xl" /><div className="skeleton mt-3 h-5 w-4/5 rounded" /><div className="skeleton mt-1 h-4 w-2/5 rounded" /></div>)}</div>
          <div className="mx-auto flex gap-2"><div className="skeleton size-3 rounded-full" /><div className="skeleton size-3 rounded-full" /><div className="skeleton size-3 rounded-full" /></div>
        </section>
      </div>
    </div>
  )
}
