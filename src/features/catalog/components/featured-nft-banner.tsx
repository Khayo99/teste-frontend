import featuredNftApe from '@/assets/home/featured-nft-ape.png'

export function FeaturedNftBanner() {
  return (
    <section
      aria-labelledby="featured-nft-heading"
      className="relative w-catalog-sidebar-width overflow-hidden bg-gradient-to-b from-primary/10 to-primary-subtle pb-1 pt-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4">
          <h2
            className="w-full px-5 text-heading text-text-accent"
            id="featured-nft-heading"
          >
            NFT EM DESTAQUE
          </h2>
          <p className="w-full px-5 text-center text-body-18-bold-compact text-text-primary">
            OFERTA LIMITADA
          </p>
        </div>
        <div className="relative h-featured-nft-artwork-height w-full overflow-hidden rounded-5xl">
          <img
            alt="NFT em destaque: macaco com chapéu verde e moletom roxo"
            className="size-full object-cover"
            src={featuredNftApe}
          />
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute left-10 top-featured-nft-orb-top size-featured-nft-orb rounded-full bg-gradient-to-br from-primary/30 to-primary/0"
      />
    </section>
  )
}
