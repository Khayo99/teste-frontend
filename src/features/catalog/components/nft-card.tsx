import { Heart, Search, ShoppingCart } from 'lucide-react'
import type { NftCardProps } from '@/@types/catalog'

export function NftCard({ nft }: NftCardProps) {
  return (
    <article className="group min-w-0 xl:w-card-width">
      <div className="relative flex h-card-visual-height items-center justify-center overflow-hidden rounded-2xl bg-surface-card">
        <img
          alt={`NFT ${nft.name} ${nft.tokenId}`}
          className="size-card-artwork rounded-2xl object-cover transition duration-300 group-hover:scale-card-hover"
          src={nft.image}
        />
        {nft.rarity && (
          <span className="absolute left-0 top-0 bg-primary px-3 py-1 text-caption-bold uppercase text-ink">
            {nft.rarity}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 hidden items-center justify-end gap-2 bg-ink/80 p-2 group-hover:flex">
          <button
            aria-label={`Adicionar ${nft.name} ao carrinho`}
            className="rounded-sm border border-text-secondary p-1 text-text-primary"
            type="button"
          >
            <ShoppingCart className="size-icon-sm" />
          </button>
          <button
            aria-label={`Favoritar ${nft.name}`}
            className="rounded-sm border border-text-secondary p-1 text-text-primary"
            type="button"
          >
            <Heart className="size-icon-sm" />
          </button>
          <button
            aria-label={`Ver ${nft.name}`}
            className="rounded-sm border border-text-secondary p-1 text-text-primary"
            type="button"
          >
            <Search className="size-icon-sm" />
          </button>
        </div>
      </div>
      <h3 className="mt-3 text-body-16-compact text-text-primary">{nft.name} {nft.tokenId}</h3>
      <p className="mt-3 text-body-18-bold-compact text-text-accent">{nft.priceEth} ETH</p>
    </article>
  )
}
