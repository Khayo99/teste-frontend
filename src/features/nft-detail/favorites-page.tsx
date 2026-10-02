import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/auth-store'
import { getFavorites } from './api/nft-detail-api'
import { queryKeys } from '@/lib/query-keys'

export function FavoritesPage() {
  const { token, user } = useAuthStore()
  const favorites = useQuery({
    queryKey: queryKeys.favorites(user!.id),
    queryFn: ({ signal }) => getFavorites(token!, signal),
    staleTime: 60_000
  })

  if (favorites.isLoading)
    return (
      <div
        className="h-48 animate-pulse rounded bg-surface-card"
        aria-label="Carregando favoritos"
      />
    )

  if (favorites.isError)
    return (
      <section className="py-16 text-center">
        <p role="alert">Não foi possível carregar seus favoritos.</p>
        <button
          type="button"
          className="mt-4 underline"
          onClick={() => void favorites.refetch()}
        >
          Tentar novamente
        </button>
      </section>
    )

  if (!favorites.data?.length)
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-bold">Favoritos</h1>
        <p className="mt-3 text-text-secondary">
          Você ainda não favoritou nenhum NFT.
        </p>
        <Link className="mt-5 inline-block underline" to="/">
          Explorar NFTs
        </Link>
      </section>
    )

  return (
    <section>
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold">Favoritos</h1>
        {favorites.isFetching && (
          <span className="text-sm text-text-secondary">Atualizando…</span>
        )}
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.data.map(nft => (
          <li key={nft.id} className="rounded bg-surface-card p-4">
            <Link
              to="/nft/$nftId"
              params={{ nftId: nft.id }}
              className="font-bold hover:underline"
            >
              {nft.name} {nft.tokenId}
            </Link>
            <p className="mt-2 text-text-secondary">{nft.priceEth} ETH</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
