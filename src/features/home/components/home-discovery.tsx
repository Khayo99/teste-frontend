import { ArrowRight } from 'lucide-react'
import galleryApe from '@/assets/optimized/home/hero-ape.jpg'
import darkApe from '@/assets/optimized/home/nft-artwork-02.jpg'
import featuredApe from '@/assets/optimized/home/nft-artwork-01.jpg'
import goldenApe from '@/assets/optimized/home/nft-artwork-03.jpg'

const promotions = [
  {
    description:
      'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    image: galleryApe,
    title: 'Lançamentos gênesis de edição limitada'
  },
  {
    description:
      'Explore novos artistas, coleções verificadas e obras digitais que definem a próxima geração.',
    image: darkApe,
    title: 'Arte digital selecionada e muito mais'
  }
]

const journalArticles = [
  {
    date: '12 de setembro',
    description: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    image: darkApe,
    readTime: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs'
  },
  {
    date: '13 de setembro',
    description: 'Conheça criadores que moldam a cultura digital.',
    image: galleryApe,
    readTime: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar'
  },
  {
    date: '15 de setembro',
    description:
      'Entenda raridade, procedência, direitos autorais e utilidade.',
    image: featuredApe,
    readTime: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência'
  },
  {
    date: '15 de setembro',
    description: 'Proteja sua carteira, seus ativos e sua identidade.',
    image: goldenApe,
    readTime: 'Leitura de 2 min',
    title: 'Como proteger sua carteira'
  }
]

export function HomeDiscovery() {
  return (
    <section
      className="flex flex-col gap-20"
      aria-label="Descobertas e conteúdo"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {promotions.map(promotion => (
          <article
            className="relative flex flex-col overflow-hidden rounded-xl bg-surface-card sm:min-h-promotion-card sm:flex-row"
            key={promotion.title}
          >
            <img
              alt=""
              className="aspect-value-4-3 w-full object-cover sm:aspect-auto sm:w-promotion-artwork sm:shrink-0"
              loading="lazy"
              src={promotion.image}
            />
            <div className="flex flex-1 flex-col items-start justify-center px-6 py-6 text-left sm:items-end sm:px-7 sm:text-right">
              <h2 className="max-w-promotion-copy text-body-16-bold-compact text-text-primary">
                {promotion.title}
              </h2>
              <p className="mt-3 max-w-promotion-copy text-body-14-copy text-text-secondary">
                {promotion.description}
              </p>
              <a
                className="mt-3 inline-flex h-8 items-center gap-1 rounded-md bg-primary px-4 text-body-14-brand text-ink transition-colors hover:bg-primary-light"
                href="#mercado"
              >
                Explorar{' '}
                <ArrowRight aria-hidden="true" className="size-icon-sm" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div>
        <header className="mx-auto mb-7 max-w-3xl text-center">
          <h2 className="text-heading text-text-primary">Diário da Cunhagem</h2>
          <p className="mt-3 text-body-14-copy text-text-secondary">
            Histórias, guias e insights para colecionadores sobre o universo da
            propriedade digital.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {journalArticles.map(article => (
            <article
              className="overflow-hidden rounded-xl bg-surface-card"
              key={article.title}
            >
              <img
              alt=""
              className="aspect-square w-full object-cover"
              loading="lazy"
              src={article.image}
              />
              <div className="p-3">
                <p className="text-tiny-medium text-text-secondary">
                  {article.date}{' '}
                  <span aria-hidden="true" className="mx-2">
                    |
                  </span>{' '}
                  {article.readTime}
                </p>
                <h3 className="mt-3 text-body-16-bold-compact text-text-primary">
                  {article.title}
                </h3>
                <p className="mt-2 text-body-14-compact text-text-secondary">
                  {article.description}
                </p>
                <a
                  className="mt-2 inline-flex items-center gap-1 text-tiny-bold text-text-accent hover:text-primary-light"
                  href="#mercado"
                >
                  Ler mais <ArrowRight aria-hidden="true" className="size-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
