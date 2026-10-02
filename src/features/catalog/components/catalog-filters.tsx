import type {
  CatalogCategory,
  CatalogFiltersProps,
  CatalogNetwork,
  CatalogQuery
} from '@/@types/catalog'
import type { FilterSectionProps } from '@/@types/components'

const categories: CatalogCategory[] = [
  'Arte digital',
  'Fotografia',
  'Música',
  'Arte 3D',
  'Colecionáveis',
  'Generativa',
  'Jogos',
  'Assinaturas',
  'Utilidade'
]
const networks: CatalogNetwork[] = ['Ethereum', 'Polygon', 'Solana']

export function CatalogFilters({ categoryCounts, onChange, query }: CatalogFiltersProps) {
  const updateQuery = (updates: Partial<CatalogQuery>) =>
    onChange({ ...query, ...updates })

  return (
    <aside className="h-catalog-sidebar-height w-catalog-sidebar-width bg-surface-card p-5">
      <FilterSection title="Coleções">
        {categories.map(category => (
          <button
            className={`flex h-10 w-full items-center justify-between px-3 text-left text-body-15-list ${query.category === category ? 'font-bold text-text-accent' : 'text-text-secondary'}`}
            key={category}
            onClick={() =>
              updateQuery({
                category: query.category === category ? null : category
              })
            }
            type="button"
          >
            <span>{category}</span>
            <span aria-hidden="true">({categoryCounts[category]})</span>
          </button>
        ))}
      </FilterSection>
      <FilterSection title="Faixa de preço">
        <div className="px-3">
          <input
            aria-label="Preço máximo"
            className="h-range-height w-full accent-primary"
            max="12.3"
            min="0.02"
            onChange={event =>
              updateQuery({ maxPrice: Number(event.target.value) })
            }
            step="0.01"
            type="range"
            value={query.maxPrice}
          />
          <p className="mt-3 text-body-15 text-text-primary">
            Preço: {query.minPrice.toFixed(2).replace('.', ',')} -{' '}
            {query.maxPrice.toFixed(2).replace('.', ',')} ETH
          </p>
          <button
            className="mt-3 h-9 w-apply-width rounded-md bg-primary text-body-16-bold-compact text-ink transition-colors hover:bg-primary-light"
            type="button"
          >
            Aplicar
          </button>
        </div>
      </FilterSection>
      <FilterSection title="Rede">
        {networks.map((network, index) => (
          <button
            className={`flex h-10 w-full items-center justify-between pl-3 text-left text-body-15-list ${query.network === network ? 'font-bold text-text-accent' : 'text-text-secondary'}`}
            key={network}
            onClick={() =>
              updateQuery({
                network: query.network === network ? null : network
              })
            }
            type="button"
          >
            <span>{network}</span>
            <span>({[119, 78, 86][index]})</span>
          </button>
        ))}
      </FilterSection>
    </aside>
  )
}

function FilterSection({ children, title }: FilterSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-body-18-bold-compact text-text-primary">{title}</h2>
      {children}
    </section>
  )
}
