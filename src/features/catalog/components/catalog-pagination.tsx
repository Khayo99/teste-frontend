import nextArrow from '@/assets/catalog/pagination-next.svg'
import { Button } from '@/components/ui/button'

type CatalogPaginationProps = {
  currentPage: number
  onPageChange: (page: number) => void
  pageCount: number
}

export function CatalogPagination({ currentPage, onPageChange, pageCount }: CatalogPaginationProps) {
  if (pageCount <= 1) return null
  const visiblePages = pageCount <= 4
    ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : currentPage <= 2
      ? [1, 2, 3, 4]
      : [1, currentPage, Math.min(currentPage + 1, pageCount), Math.min(currentPage + 2, pageCount)]
  const uniquePages = [...new Set(visiblePages)]

  return (
    <nav aria-label="Paginação do catálogo" className="mt-12 flex items-center gap-2">
      {uniquePages.map(page => (
        <Button
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Página ${page}`}
          className={page === currentPage ? 'border-primary bg-primary font-bold text-ink' : undefined}
          key={page}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </Button>
      ))}
      <Button
        aria-label="Próxima página"
        className="disabled:cursor-not-allowed"
        disabled={currentPage === pageCount}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <img alt="" className="block max-w-none" src={nextArrow} />
      </Button>
    </nav>
  )
}
