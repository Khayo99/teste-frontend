import { useState } from 'react'
import { ChevronLeft, ZoomIn } from 'lucide-react'
import mobileHeroArtwork from '@/assets/nft-detail/mobile/nft-hero-artwork.png'
import mobileGalleryPagination from '@/assets/nft-detail/mobile/gallery-pagination.svg'

export function NftGallery({
  gallery,
  name
}: {
  gallery: string[]
  name: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = gallery[activeIndex] ?? gallery[0]
  const isEmeraldApe = name.startsWith('Emerald Ape')

  return (
    <div>
      <section className="relative -mb-value-114 h-value-506 overflow-hidden bg-nft-gallery-mobile md:hidden">
        <div className="mx-auto flex w-nft-gallery-mobile-width flex-col gap-2 pt-value-23">
          <div className="flex items-center justify-between">
            <button
              aria-label="Voltar"
              className="grid size-value-35 place-items-center rounded-full border border-border bg-surface-raised"
              onClick={() => window.history.back()}
              type="button"
            >
              <ChevronLeft
                aria-label="Voltar"
                className="size-5 text-text-accent"
              />
            </button>
          </div>
          <div className="relative h-value-356 overflow-hidden rounded-value-24">
            <img
              alt={`Imagem principal de ${name}`}
              className="size-full object-cover"
              src={isEmeraldApe ? mobileHeroArtwork : activeImage}
            />
          </div>
        </div>
        <img
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-value-365 h-value-7 w-value-56 -translate-x-1/2"
          src={mobileGalleryPagination}
        />
      </section>
      <div className="hidden flex-col-reverse gap-4 lg:flex-row md:flex">
        <div className="flex gap-4 overflow-x-auto lg:w-value-100 lg:flex-col lg:overflow-visible">
          {gallery.map((image, index) => (
            <button
              aria-label={`Ver imagem ${index + 1} de ${name}`}
              aria-pressed={activeIndex === index}
              className={`size-value-100 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
                activeIndex === index
                  ? 'border-text-accent'
                  : 'border-transparent hover:border-border'
              }`}
              key={`${image}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <img alt="" className="size-full object-cover" src={image} />
            </button>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-surface-card">
          <img
            alt={`Imagem principal de ${name}`}
            className="aspect-square size-full object-cover"
            src={activeImage}
          />
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 grid size-value-30 place-items-center rounded-full bg-ink/70 text-text-primary"
          >
            <ZoomIn className="size-icon-sm" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </div>
  )
}
