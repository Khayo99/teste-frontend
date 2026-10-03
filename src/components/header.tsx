import { Menu, Search, ShoppingCart } from 'lucide-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/auth-store'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/features/cart/cart-store'
import { Input } from '@/components/ui/input'
import type { CatalogSearch } from '@/@types/catalog'
import { useEffect, useRef, useState } from 'react'

export function Header() {
  const location = useLocation()
  const { status, user, openAuthModal } = useAuthStore()
  const navigate = useNavigate()
  const itemCount = useCartStore(state =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )
  const isNftDetailPage = location.pathname.startsWith('/nft/')
  const isMarketPage = isNftDetailPage || location.pathname === '/cart'
  const isHomePage = location.pathname === '/'
  const usesMobileScreenHeader =
    isHomePage || isNftDetailPage || location.pathname === '/cart'
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')
  const menuCloseRef = useRef<HTMLButtonElement>(null)

  const submitSearch = () => {
    void navigate({
      to: '/',
      search: (previous: CatalogSearch) => ({
        ...previous,
        search: catalogSearch.trim(),
        page: 1
      })
    })
    setSearchOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    menuCloseRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header
      className={`relative h-header-height border-b border-border ${usesMobileScreenHeader ? 'hidden md:block' : ''}`}
    >
      <div className="flex h-header-inner items-start justify-between">
        <a className="pt-2 text-body-14-brand text-foreground" href="/">
          KURIO
        </a>
        <nav
          aria-label="Principal"
          className="hidden h-header-inner items-start gap-10 text-body-16 text-foreground md:flex xl:absolute xl:left-header-nav-offset"
        >
          <a
            aria-current={!isMarketPage ? 'page' : undefined}
            className={
              !isMarketPage
                ? 'h-header-height border-b-2 border-text-accent font-bold text-text-accent'
                : 'transition-colors hover:text-text-accent'
            }
            href="/"
          >
            Início
          </a>
          <a
            aria-current={isMarketPage ? 'page' : undefined}
            className={
              isMarketPage
                ? 'h-header-height border-b-2 border-text-accent font-bold text-text-accent'
                : 'transition-colors hover:text-text-accent'
            }
            href="#mercado"
          >
            Mercado
          </a>
          <a
            className="transition-colors hover:text-text-accent"
            href="#criadores"
          >
            Criadores
          </a>
          <a
            className="transition-colors hover:text-text-accent"
            href="#aprenda"
          >
            Aprenda
          </a>
        </nav>
        <div className="flex h-header-actions items-center gap-7 text-foreground">
          {searchOpen ? (
            <form
              className="flex items-center gap-2"
              onSubmit={event => {
                event.preventDefault()
                submitSearch()
              }}
            >
              <Input
                aria-label="Buscar NFTs"
                autoFocus
                className="h-8 w-40 px-2 text-sm"
                onChange={event => setCatalogSearch(event.target.value)}
                placeholder="Buscar NFTs"
                value={catalogSearch}
              />
              <Button
                className="h-8 px-2 text-sm"
                type="submit"
                variant="ghost"
              >
                Buscar
              </Button>
            </form>
          ) : (
            <Button
              aria-label="Buscar"
              className="grid size-5 place-items-center p-0"
              onClick={() => setSearchOpen(true)}
              variant="ghost"
              type="button"
            >
              <Search className="size-icon-md stroke-icon" />
            </Button>
          )}
          <Button
            aria-label="Carrinho"
            className="relative grid size-5 place-items-center p-0"
            onClick={() => void navigate({ to: '/cart' })}
            variant="ghost"
            type="button"
          >
            <ShoppingCart className="size-icon-md stroke-icon" />
            <span
              aria-label={`${itemCount} itens no carrinho`}
              className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-primary text-tiny-medium text-ink"
            >
              {itemCount}
            </span>
          </Button>
          <Button
            className="hidden h-header-actions w-login-width place-items-center rounded-md bg-primary text-body-16-medium text-ink transition-colors hover:bg-primary-light sm:grid"
            variant="primary"
            onClick={() => {
              if (status === 'authenticated') void navigate({ to: '/profile' })
              else openAuthModal('login', location.pathname)
            }}
          >
            {status === 'authenticated' && user ? user.name : 'Entrar'}
          </Button>
          <Button
            aria-label="Abrir navegação"
            className="grid size-5 place-items-center p-0 md:hidden"
            variant="ghost"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-icon-lg" />
          </Button>
        </div>
      </div>
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setMenuOpen(false)
          }}
        >
          <nav
            aria-label="Navegação móvel"
            aria-modal="true"
            className="ml-auto flex h-full w-[min(86vw,340px)] flex-col gap-6 bg-surface-card p-6 shadow-2xl"
            id="mobile-navigation"
            role="dialog"
          >
            <button
              aria-label="Fechar navegação"
              className="ml-auto grid size-10 place-items-center rounded-md p-0 text-text-accent hover:text-text-primary focus-visible:outline-2 focus-visible:outline-text-accent"
              onClick={() => setMenuOpen(false)}
              ref={menuCloseRef}
              type="button"
            >
              ×
            </button>
            {[
              ['Início', '/'],
              ['Mercado', '/#mercado'],
              ['Criadores', '/#criadores'],
              ['Aprenda', '/#aprenda']
            ].map(([label, href]) => (
              <a
                className="py-2 text-body-18-bold text-foreground hover:text-text-accent"
                href={href}
                key={label}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <Button
              className="mt-auto h-11 w-full"
              onClick={() => {
                setMenuOpen(false)
                if (status === 'authenticated')
                  void navigate({ to: '/profile' })
                else openAuthModal('login', location.pathname)
              }}
              type="button"
            >
              {status === 'authenticated' && user ? user.name : 'Entrar'}
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
