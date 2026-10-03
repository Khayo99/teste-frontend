import { Heart, ShoppingCart } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { NftCardProps } from '@/@types/catalog'
import { Button } from '@/components/ui/button'
import { addCartItem } from '@/features/cart/cart-api'
import { useCartStore } from '@/features/cart/cart-store'
import { useAuthStore } from '@/features/auth/auth-store'
import { setFavorite } from '@/features/nft-detail/api/nft-detail-api'

export function NftCard({ mobileImage, nft }: NftCardProps) {
  const navigate = useNavigate()
  const addItem = useCartStore(state => state.addItem)
  const { status, token, openAuthModal } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoritePending, setFavoritePending] = useState(false)
  const [cartPending, setCartPending] = useState(false)
  const goToDetail = () =>
    void navigate({
      to: '/nft/$nftId',
      params: { nftId: nft.id },
      resetScroll: true
    })
  const toggleFavorite = async () => {
    if (status !== 'authenticated' || !token) {
      openAuthModal('login', `/nft/${nft.id}`)
      return
    }
    const nextValue = !isFavorite
    setFavoritePending(true)
    setIsFavorite(nextValue)
    try {
      setIsFavorite(await setFavorite(nft.id, token, nextValue))
    } catch {
      setIsFavorite(isFavorite)
    } finally {
      setFavoritePending(false)
    }
  }
  const addToCart = async () => {
    if (nft.availability <= 0) return
    setCartPending(true)
    try {
      await addCartItem({ id: nft.id, editionId: 'ABERTA', quantity: 1 })
      addItem({
        editionId: 'ABERTA',
        editionLabel: 'ABERTA',
        id: nft.id,
        image: nft.image,
        name: nft.name,
        priceEth: nft.priceEth,
        quantity: 1,
        stock: nft.availability,
        tokenId: nft.tokenId
      })
    } catch {
      // The card remains available for another attempt.
    } finally {
      setCartPending(false)
    }
  }

  return (
    <article className="group min-w-0">
      <div
        className="relative flex h-value-200 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-surface-card sm:h-card-visual-height"
        onClick={goToDetail}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') goToDetail()
        }}
        role="link"
        tabIndex={0}
        aria-label={`Ver ${nft.name} ${nft.tokenId}`}
      >
        <picture className="size-card-mobile-artwork sm:size-card-artwork">
          {mobileImage && (
            <source media="(max-width: 639px)" srcSet={mobileImage} />
          )}
          <img
            alt={`NFT ${nft.name} ${nft.tokenId}`}
            className="size-full rounded-2xl object-cover transition duration-300 group-hover:scale-card-hover"
            loading="lazy"
            src={nft.image}
          />
        </picture>
        {nft.rarity && (
          <span className="absolute left-0 top-0 bg-primary px-3 py-1 text-caption-bold uppercase text-ink">
            {nft.rarity}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 hidden items-center justify-end gap-2 bg-ink/80 p-2 group-hover:flex">
          <Button
            aria-label={`Adicionar ${nft.name} ao carrinho`}
            className="rounded-sm border border-text-secondary p-1 text-text-primary"
            disabled={cartPending || nft.availability <= 0}
            onClick={event => {
              event.stopPropagation()
              void addToCart()
            }}
            variant="ghost"
            type="button"
          >
            <ShoppingCart className="size-icon-sm" />
          </Button>
          <Button
            aria-label={isFavorite ? `Remover ${nft.name} dos favoritos` : `Favoritar ${nft.name}`}
            aria-pressed={isFavorite}
            className="rounded-sm border border-text-secondary p-1 text-text-primary"
            disabled={favoritePending}
            onClick={event => {
              event.stopPropagation()
              void toggleFavorite()
            }}
            variant="ghost"
            type="button"
          >
            <Heart className={`size-icon-sm ${isFavorite ? 'fill-text-coral text-text-coral' : ''}`} />
          </Button>
        </div>
      </div>
      <Link
        className="mt-2 block pl-2 text-value-15 leading-normal text-text-primary hover:text-text-accent sm:mt-3 sm:pl-0 sm:text-body-16-compact"
        params={{ nftId: nft.id }}
        resetScroll
        to="/nft/$nftId"
      >
        {nft.name} {nft.tokenId}
      </Link>
      <p className="mt-1 pl-2 text-value-16 font-bold leading-4 text-text-accent sm:mt-3 sm:pl-0 sm:text-body-18-bold-compact">
        {nft.priceEth} ETH
      </p>
    </article>
  )
}
