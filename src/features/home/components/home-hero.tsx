import heroApe from '@/assets/home/hero-ape.png'

export function HomeHero() {
  return (
    <section className="flex min-h-hero-height flex-col overflow-hidden bg-ink lg:h-hero-height lg:flex-row lg:items-start lg:gap-hero-gap lg:pl-10">
      <div className="flex flex-1 flex-col px-6 py-12 lg:w-hero-copy-width lg:flex-none lg:px-0 lg:pb-0 lg:pt-hero-copy-offset">
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
      <div className="size-full min-h-hero-mobile-height overflow-hidden lg:size-hero-height lg:min-h-0 lg:shrink-0">
        <img
          alt="Colecionador Kurio"
          className="size-full object-cover object-center"
          src={heroApe}
        />
      </div>
    </section>
  )
}
