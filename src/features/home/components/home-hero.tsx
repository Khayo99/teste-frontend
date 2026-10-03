import heroApe from '@/assets/optimized/home/hero-ape.jpg'
import mobileNftOne from '@/assets/optimized/home/mobile-nft-01.jpg'
import mobileNftTwo from '@/assets/optimized/home/mobile-nft-02.jpg'
import type { CatalogSearch } from '@/@types/catalog'
import { Input } from '@/components/ui/input'
import { useNavigate } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react'

export function HomeHero() {
  const navigate = useNavigate({ from: '/' })
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState('')

  const submitMobileSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void navigate({
      to: '/',
      search: (previous: CatalogSearch) => ({
        ...previous,
        page: 1,
        search: mobileSearch.trim()
      })
    })
    document.getElementById('mercado')?.scrollIntoView({ behavior: 'smooth' })
    setIsMobileSearchOpen(false)
  }

  return (
    <>
      <section
        className="mb-4 flex gap-2 md:hidden"
        aria-label="Explorar coleções"
      >
        {isMobileSearchOpen ? (
          <form
            className="flex h-value-45 min-w-0 flex-1 items-center gap-2 rounded-value-10 bg-surface-card px-3"
            onSubmit={submitMobileSearch}
          >
            <Search
              aria-hidden="true"
              className="size-value-20 shrink-0 text-secondary"
            />
            <Input
              aria-label="Buscar NFTs"
              autoFocus
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-body-14-brand focus:border-0 focus:ring-0"
              onChange={event => setMobileSearch(event.target.value)}
              placeholder="Buscar NFTs"
              type="search"
              value={mobileSearch}
            />
            <button
              aria-label="Pesquisar"
              className="grid size-7 shrink-0 place-items-center text-text-accent"
              type="submit"
            >
              <Search aria-hidden="true" className="size-value-18" />
            </button>
            <button
              aria-label="Fechar busca"
              className="grid size-7 shrink-0 place-items-center text-secondary"
              onClick={() => setIsMobileSearchOpen(false)}
              type="button"
            >
              <X aria-hidden="true" className="size-value-18" />
            </button>
          </form>
        ) : (
          <button
            className="flex h-value-45 min-w-0 flex-1 items-center gap-2 rounded-value-10 bg-surface-card px-3 text-left text-body-14-brand text-secondary"
            onClick={() => setIsMobileSearchOpen(true)}
            type="button"
          >
            <Search aria-hidden="true" className="size-value-22 shrink-0" />
            Explorar coleções
          </button>
        )}
        <button
          aria-label="Abrir filtros"
          className="grid size-value-45 place-items-center rounded-value-14 bg-primary/80 text-ink"
          onClick={() =>
            window.dispatchEvent(new Event('kurio:open-catalog-filters'))
          }
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" className="size-value-22" />
        </button>
      </section>
      <section className="relative hidden min-h-hero-height flex-col overflow-hidden bg-ink lg:flex lg:h-hero-height lg:flex-row lg:items-start lg:gap-hero-gap lg:pl-10">
        <div className="flex flex-1 flex-col px-0 py-8 sm:px-6 sm:py-12 lg:w-hero-copy-width lg:flex-none lg:px-0 lg:pb-0 lg:pt-hero-copy-offset">
          <p className="text-body-14-label text-text-secondary">
            Bem-vindo à Kurio
          </p>
          <h1 className="mt-2 text-display text-text-primary">
            SEJA DONO DO FUTURO
            <br className="hidden sm:block" /> DA ARTE DIGITAL
          </h1>
          <p className="mt-1 max-w-hero-description-width text-body-14-relaxed text-text-secondary">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>
          <a
            className="mt-8 grid h-10 w-hero-cta-width place-items-center rounded-md bg-primary text-body-16-bold-compact text-ink transition-colors hover:bg-primary-light"
            href="#mercado"
          >
            EXPLORAR
          </a>
        </div>
        <div className="size-full min-h-value-240 overflow-hidden sm:min-h-hero-mobile-height lg:size-hero-height lg:min-h-0 lg:shrink-0">
          <img
            alt="Colecionador Kurio"
            className="size-full object-cover object-center"
            fetchPriority="high"
            src={heroApe}
          />
        </div>
      </section>
      <section className="relative flex overflow-hidden rounded-value-28 bg-hero-mobile p-4 md:hidden">
        <div className="flex min-w-0 flex-1 flex-col pt-2">
          <p className="text-value-12 font-medium leading-4 text-foreground">
            Bem-vindo à Kurio
          </p>
          <h1 className="mt-1 text-value-18 font-bold leading-value-29 text-foreground">
            SEJA DONO DA
            <br />
            CULTURA DIGITAL
          </h1>
          <p className="mt-1 max-w-hero-mobile-description-width text-value-12 leading-value-18 text-text-secondary">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <a
            className="mt-1 inline-flex items-center gap-2 text-value-12 font-bold leading-value-14 text-text-accent"
            href="#mercado"
          >
            EXPLORAR <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </div>
        <div className="relative w-value-138 shrink-0">
          <img
            alt="NFT em destaque"
            className="size-value-138 rounded-2xl object-cover shadow-hero-mobile-artwork"
            fetchPriority="high"
            src={mobileNftOne}
          />
          <img
            alt=""
            aria-hidden="true"
            className="absolute -bottom-1 -right-1 size-value-58 rounded-2xl object-cover shadow-lg"
            src={mobileNftTwo}
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1"
        >
          <span className="h-value-7 w-4 rounded-full bg-primary" />
          <span className="size-value-7 rounded-full bg-foreground/50" />
          <span className="size-value-7 rounded-full bg-foreground/50" />
        </div>
      </section>
    </>
  )
}
