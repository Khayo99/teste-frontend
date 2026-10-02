import { Menu, Search, ShoppingCart } from 'lucide-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/auth-store'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/features/cart/cart-store'
import { Input } from '@/components/ui/input'
import type { CatalogSearch } from '@/@types/catalog'
import { useState } from 'react'

export function Header() {
  const location = useLocation()
  const { status, user, openAuthModal } = useAuthStore()
  const navigate = useNavigate()
  const itemCount = useCartStore(state => state.items.reduce((total, item) => total + item.quantity, 0))
  const isNftDetailPage = location.pathname.startsWith('/nft/')
  const [searchOpen, setSearchOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')

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

  return (
    <header className="relative h-header-height border-b border-border">
      <div className="flex h-header-inner items-start justify-between">
        <a className="pt-2 text-body-14-brand text-foreground" href="/">
          KURIO
        </a>
        <nav
          aria-label="Principal"
          className="hidden h-header-inner items-start gap-10 text-body-16 text-foreground md:flex xl:absolute xl:left-header-nav-offset"
        >
          <a
            aria-current={!isNftDetailPage ? 'page' : undefined}
            className={
              !isNftDetailPage
                ? 'h-header-height border-b-2 border-text-accent font-bold text-text-accent'
                : 'transition-colors hover:text-text-accent'
            }
            href="/"
          >
            Início
          </a>
          <a
            aria-current={isNftDetailPage ? 'page' : undefined}
            className={
              isNftDetailPage
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
              <Button className="h-8 px-2 text-sm" type="submit" variant="ghost">
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
            <span aria-label={`${itemCount} itens no carrinho`} className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-primary text-tiny-medium text-ink">
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
          >
            <Menu className="size-icon-lg" />
          </Button>
        </div>
      </div>
    </header>
  )
}
