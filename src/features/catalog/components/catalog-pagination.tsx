import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CatalogPaginationProps = {
  currentPage: number
  onPageChange: (page: number) => void
  pageCount: number
}

export function CatalogPagination({
  currentPage,
  onPageChange,
  pageCount
}: CatalogPaginationProps) {
  if (pageCount <= 1) return null
  const pageWindowStart = Math.min(
    Math.max(1, currentPage - 2),
    Math.max(1, pageCount - 3)
  )
  const visiblePages = Array.from(
    { length: Math.min(4, pageCount) },
    (_, index) => pageWindowStart + index
  )

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="mt-12 flex items-center gap-2"
    >
      {visiblePages.map(page => (
        <Button
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Página ${page}`}
          variant="pagination"
          className={
            page === currentPage
              ? 'border-primary bg-primary font-bold text-ink'
              : undefined
          }
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
        variant="pagination"
      >
        <ChevronRight aria-hidden="true" size={18} strokeWidth={1.8} />
      </Button>
    </nav>
  )
}
