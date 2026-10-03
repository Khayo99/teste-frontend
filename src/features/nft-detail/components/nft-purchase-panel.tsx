import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Heart, Share2, Star } from 'lucide-react'
import type { EditionLabel, NftDetail } from '@/@types/nft-detail'
import { useAuthStore } from '@/features/auth/auth-store'
import { setFavorite } from '@/features/nft-detail/api/nft-detail-api'
import { clampQuantity } from '@/features/nft-detail/lib/nft-detail-validation'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/features/cart/cart-store'
import { queryKeys } from '@/lib/query-keys'
import mobileHeartIcon from '@/assets/nft-detail/mobile/heart.svg'
import mobileStarIcon from '@/assets/nft-detail/mobile/star.svg'
import mobileQuantityPlusIcon from '@/assets/nft-detail/mobile/quantity-plus.svg'
import mobileQuantityMinusIcon from '@/assets/nft-detail/mobile/quantity-minus.svg'
import mobileShopIcon from '@/assets/nft-detail/mobile/shop.svg'

const editionOptions: EditionLabel[] = ['1/1', '1/10', '1/50', 'ABERTA']
const PENDING_FAVORITE_KEY = 'kurio.pending-favorite'

export function NftPurchasePanel({ nft }: { nft: NftDetail }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { status, token, openAuthModal } = useAuthStore()
  const userId = useAuthStore(state => state.user?.id ?? null)
  const addItem = useCartStore(state => state.addItem)
  const [quantity, setQuantity] = useState(() =>
    clampQuantity(1, nft.availability)
  )
  const [feedback, setFeedback] = useState<string | null>(null)
  const favoriteIntentHandled = useRef(false)
  const isSoldOut = nft.availability <= 0

  const favoriteMutation = useMutation({
    mutationFn: (nextIsFavorite: boolean) => {
      if (!token) throw new Error('unauthenticated')
      return setFavorite(nft.id, token, nextIsFavorite)
    },
    onMutate: async nextIsFavorite => {
      const key = queryKeys.nft(nft.id, userId)
      await queryClient.cancelQueries({ queryKey: key })
      const detail = queryClient.getQueryData<NftDetail>(key)
      const favoritesKey = userId ? queryKeys.favorites(userId) : null
      const favorites = favoritesKey
        ? queryClient.getQueryData<NftDetail[]>(favoritesKey)
        : undefined
      queryClient.setQueryData<NftDetail>(key, current =>
        current ? { ...current, isFavorite: nextIsFavorite } : current
      )
      if (favoritesKey)
        queryClient.setQueryData<NftDetail[]>(favoritesKey, current => {
          if (nextIsFavorite)
            return current?.some(item => item.id === nft.id)
              ? current
              : [...(current ?? []), { ...nft, isFavorite: true }]
          return current?.filter(item => item.id !== nft.id) ?? []
        })
      return { detail, favorites, key, favoritesKey }
    },
    onError: (error, _next, context) => {
      if (context?.detail) queryClient.setQueryData(context.key, context.detail)
      if (context?.favoritesKey)
        queryClient.setQueryData(context.favoritesKey, context.favorites)
      if ((error as Error).message === 'unauthenticated') return
      setFeedback('Não foi possível atualizar o favorito. Tente novamente.')
    },
    onSuccess: isFavorite => {
      queryClient.setQueryData<NftDetail>(
        queryKeys.nft(nft.id, userId),
        current => (current ? { ...current, isFavorite } : current)
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.nft(nft.id, userId)
      })
      if (userId)
        void queryClient.invalidateQueries({
          queryKey: queryKeys.favorites(userId)
        })
    }
  })

  useEffect(() => {
    const shouldFavoriteAfterLogin =
      sessionStorage.getItem(PENDING_FAVORITE_KEY) === nft.id

    if (
      !shouldFavoriteAfterLogin ||
      status !== 'authenticated' ||
      nft.isFavorite ||
      favoriteIntentHandled.current
    )
      return

    favoriteIntentHandled.current = true
    sessionStorage.removeItem(PENDING_FAVORITE_KEY)
    favoriteMutation.mutate(true)
  }, [favoriteMutation, nft.id, nft.isFavorite, status])

  const handleFavorite = () => {
    if (status !== 'authenticated') {
      sessionStorage.setItem(PENDING_FAVORITE_KEY, nft.id)
      openAuthModal('login', `/nft/${nft.id}`)
      return
    }
    favoriteMutation.mutate(!nft.isFavorite)
  }

  const handleBuy = () => {
    if (isSoldOut) return
    addItem({
      id: nft.id,
      image: nft.image,
      name: nft.name,
      tokenId: nft.tokenId,
      editionId: nft.editionLabel,
      editionLabel: nft.editionLabel,
      priceEth: nft.priceEth,
      quantity,
      stock: nft.availability
    })
    void navigate({ to: '/cart' })
  }

  const adjustQuantity = (delta: number) =>
    setQuantity(current => clampQuantity(current + delta, nft.availability))

  return (
    <>
      <div className="relative z-10 flex min-h-value-504 flex-col gap-3 rounded-t-value-31 bg-surface-card px-6 pb-44 pt-8 md:hidden">
        <button
          aria-label={
            nft.isFavorite ? 'Remover dos favoritos' : 'Favoritar NFT'
          }
          aria-pressed={Boolean(nft.isFavorite)}
          className="absolute -top-value-369 right-6 grid size-value-35 place-items-center rounded-full border border-border bg-surface-raised"
          disabled={favoriteMutation.isPending}
          onClick={handleFavorite}
          type="button"
        >
          <img
            alt=""
            className={`h-value-14 w-4 ${nft.isFavorite ? 'brightness-150 sepia' : ''}`}
            src={mobileHeartIcon}
          />
        </button>
        <div className="flex items-center justify-between gap-3 overflow-hidden">
          <h1 className="whitespace-nowrap text-value-20 font-bold leading-4 text-foreground">
            {nft.name} {nft.tokenId}
          </h1>
          <div className="flex shrink-0 items-center rounded-full border border-primary px-2 py-value-5">
            <img alt="" className="mr-1 size-value-14" src={mobileStarIcon} />
            <span className="text-value-14 font-medium leading-4 text-foreground">
              {nft.reviews.average}
            </span>
            <span className="ml-2 text-value-14 leading-4 text-text-secondary">
              ({nft.reviews.count})
            </span>
          </div>
        </div>
        <p className="line-clamp-3 min-h-value-71 text-value-14 leading-6 text-text-secondary">
          {nft.description}
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-value-15 font-bold leading-4 text-foreground">
            Edição:
          </p>
          <div className="flex gap-3" role="group" aria-label="Edição">
            {editionOptions.map(option => (
              <span
                className={`grid h-7 place-items-center rounded-full border px-1 text-value-14 leading-4 ${option === nft.editionLabel ? 'border-primary font-medium text-text-accent' : 'border-border text-text-secondary'} ${option === '1/1' ? 'w-9' : option === '1/10' ? 'w-value-42' : option === '1/50' ? 'w-value-46' : 'w-value-66'}`}
                key={option}
              >
                {option}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-1 flex flex-col gap-3 text-value-15 leading-4 text-secondary">
          <p>ID do token: {nft.tokenId}</p>
          <p>Coleção: {nft.collection.name}</p>
          <p>
            Atributos:{' '}
            {nft.attributes.map(attribute => attribute.value).join(', ')}
          </p>
        </div>
        {feedback && (
          <p
            aria-live="polite"
            className="text-body-14-compact text-text-accent"
            role="status"
          >
            {feedback}
          </p>
        )}
        {isSoldOut && (
          <p className="text-body-14-compact text-text-secondary" role="status">
            Esta edição está indisponível no momento.
          </p>
        )}
        <div className="fixed inset-x-0 bottom-0 z-30 rounded-t-value-40 bg-surface-card px-6 pb-9 pt-5 shadow-design md:hidden">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-value-15 font-medium leading-4 text-text-secondary">
                  Qtd.
                </span>
                <div
                  className="flex items-center gap-3"
                  role="group"
                  aria-label="Quantidade"
                >
                  <button
                    aria-label="Aumentar quantidade"
                    className="grid h-value-30 w-5 place-items-center rounded-full border border-ink bg-primary shadow-purchase-control disabled:opacity-40"
                    disabled={isSoldOut || quantity >= nft.availability}
                    onClick={() => adjustQuantity(1)}
                    type="button"
                  >
                    <img
                      alt=""
                      className="size-4"
                      src={mobileQuantityPlusIcon}
                    />
                  </button>
                  <span
                    aria-live="polite"
                    className="w-4 text-center text-value-18 font-medium leading-value-25 text-foreground"
                  >
                    {isSoldOut ? 0 : quantity}
                  </span>
                  <button
                    aria-label="Diminuir quantidade"
                    className="grid h-value-30 w-5 place-items-center rounded-full border border-ink bg-primary shadow-purchase-control disabled:opacity-40"
                    disabled={isSoldOut || quantity <= 1}
                    onClick={() => adjustQuantity(-1)}
                    type="button"
                  >
                    <img
                      alt=""
                      className="size-4"
                      src={mobileQuantityMinusIcon}
                    />
                  </button>
                </div>
              </div>
              <p className="text-right text-value-20 font-bold leading-4 text-text-accent">
                {nft.priceEth} ETH
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                className="h-value-60 w-value-196 rounded-value-40 bg-purchase-primary px-0"
                disabled={isSoldOut}
                onClick={handleBuy}
                type="button"
              >
                <span className="text-value-16 font-bold leading-5 text-ink">
                  {isSoldOut ? 'Esgotado' : 'Comprar NFT'}
                </span>
              </Button>
              <button
                aria-label="Abrir carrinho"
                className="grid size-value-60 place-items-center rounded-full border border-border bg-surface-raised"
                onClick={() => void navigate({ to: '/cart' })}
                type="button"
              >
                <img alt="" className="size-5" src={mobileShopIcon} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden flex-col gap-8 md:flex">
        <div className="flex flex-col gap-1">
          <h1 className="text-product-title text-foreground">
            {nft.name} {nft.tokenId}
          </h1>
          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-3">
            <p className="text-product-price text-text-accent">
              {nft.priceEth} ETH
            </p>
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  className={`size-value-15 ${
                    index < Math.round(nft.reviews.average)
                      ? 'fill-text-accent text-text-accent'
                      : 'fill-transparent text-text-secondary'
                  }`}
                  key={index}
                />
              ))}
              <span className="text-value-15 leading-normal text-foreground">
                {nft.reviews.count} avaliações de colecionadores
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-value-15 font-bold leading-4 text-foreground">
            Sobre este NFT:
          </p>
          <p className="max-w-143.5 text-value-14 leading-6 text-text-secondary">
            {nft.description}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-value-15 font-bold leading-4 text-foreground">
            Edição:
          </p>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Edição"
          >
            {editionOptions.map(option => (
              <span
                className={`grid h-7 place-items-center rounded-full border px-1 text-value-14 leading-4 ${
                  option === nft.editionLabel
                    ? 'border-primary font-medium text-text-accent'
                    : 'border-border text-text-secondary'
                } ${
                  option === '1/1'
                    ? 'w-9'
                    : option === '1/10'
                      ? 'w-value-42'
                      : option === '1/50'
                        ? 'w-value-46'
                        : 'w-value-66'
                }`}
                key={option}
              >
                {option}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 lg:justify-between">
          <div
            className="flex h-value-49-5 items-center gap-3"
            role="group"
            aria-label="Quantidade"
          >
            <Button
              aria-label="Diminuir quantidade"
              className="h-value-49-5 w-value-33 rounded-value-33 border-ink bg-primary text-value-26-4 text-ink shadow-purchase-quantity hover:bg-primary-light"
              disabled={isSoldOut || quantity <= 1}
              onClick={() => adjustQuantity(-1)}
              type="button"
              variant="outline"
            >
              −
            </Button>
            <span
              className="w-6 text-center text-value-20 leading-7 text-foreground"
              aria-live="polite"
            >
              {isSoldOut ? 0 : quantity}
            </span>
            <Button
              aria-label="Aumentar quantidade"
              className="h-value-49-5 w-value-33 rounded-value-33 border-ink bg-primary text-value-26-4 text-ink shadow-purchase-quantity hover:bg-primary-light"
              disabled={isSoldOut || quantity >= nft.availability}
              onClick={() => adjustQuantity(1)}
              type="button"
              variant="outline"
            >
              +
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="h-10 w-value-130 px-0"
              disabled={isSoldOut}
              onClick={handleBuy}
              type="button"
            >
              <span className="text-value-14 font-bold leading-5 text-ink uppercase">
                {isSoldOut ? 'Esgotado' : 'Comprar'}
              </span>
            </Button>
            <Button
              aria-pressed={Boolean(nft.isFavorite)}
              className="h-10 w-value-130 gap-2 border-primary px-0 text-text-accent"
              disabled={favoriteMutation.isPending}
              onClick={handleFavorite}
              type="button"
              variant="outline"
            >
              <Heart
                className={`size-5 ${nft.isFavorite ? 'fill-text-coral text-text-coral' : ''}`}
              />
              <span className="text-value-14 font-medium leading-5">
                Favoritar
              </span>
            </Button>
          </div>
        </div>

        {feedback && (
          <p
            aria-live="polite"
            className="text-body-14-compact text-text-accent"
            role="status"
          >
            {feedback}
          </p>
        )}

        {isSoldOut && (
          <p className="text-body-14-compact text-text-secondary" role="status">
            Esta edição está indisponível no momento.
          </p>
        )}

        <div className="flex flex-col gap-3 text-value-15 leading-normal text-secondary">
          <p>ID do token: {nft.tokenId}</p>
          <p>Coleção: {nft.collection.name}</p>
          <p>
            Atributos:{' '}
            {nft.attributes.map(attribute => attribute.value).join(', ')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-value-15 font-bold leading-4 text-foreground">
            Compartilhar este NFT:
          </p>
          <Share2
            aria-hidden="true"
            className="size-icon-sm text-text-secondary"
          />
        </div>
      </div>
    </>
  )
}
