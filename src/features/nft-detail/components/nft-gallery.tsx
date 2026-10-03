import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import mobileHeroArtwork from '@/assets/nft-detail/mobile/nft-hero-artwork.png'
import mobileBackIcon from '@/assets/nft-detail/mobile/back.svg'
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
      <section className="relative -mb-[114px] h-[506px] overflow-hidden bg-[linear-gradient(138deg,#241612_12%,#2f1d15_107%)] md:hidden">
        <div className="mx-auto flex w-[min(calc(100%_-_56px),361px)] flex-col gap-2 pt-[23px]">
          <div className="flex items-center justify-between">
            <button
              aria-label="Voltar"
              className="grid size-[35px] place-items-center rounded-full border border-border bg-surface-raised p-2"
              onClick={() => window.history.back()}
              type="button"
            >
              <img alt="" className="size-5" src={mobileBackIcon} />
            </button>
          </div>
          <div className="relative h-[356px] overflow-hidden rounded-[24px]">
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
          className="absolute left-1/2 top-[365px] h-[7px] w-[56px] -translate-x-1/2"
          src={mobileGalleryPagination}
        />
      </section>
      <div className="hidden flex-col-reverse gap-4 lg:flex-row md:flex">
        <div className="flex gap-4 overflow-x-auto lg:w-[100px] lg:flex-col lg:overflow-visible">
          {gallery.map((image, index) => (
            <button
              aria-label={`Ver imagem ${index + 1} de ${name}`}
              aria-pressed={activeIndex === index}
              className={`size-[100px] shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${
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
            className="absolute right-4 top-4 grid size-[30px] place-items-center rounded-full bg-ink/70 text-text-primary"
          >
            <ZoomIn className="size-icon-sm" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </div>
  )
}
