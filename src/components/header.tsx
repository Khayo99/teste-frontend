import { Menu, Search, ShoppingCart } from 'lucide-react'
import { useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/auth-store'
import { Button } from '@/components/ui/button'

export function Header() {
  const location = useLocation()
  const { status, user, clear, openAuthModal } = useAuthStore()
  const isNftDetailPage = location.pathname.startsWith('/nft/')

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
          <Button
            aria-label="Buscar"
            className="grid size-5 place-items-center p-0"
            variant="ghost"
            type="button"
          >
            <Search className="size-icon-md stroke-icon" />
          </Button>
          <Button
            aria-label="Carrinho"
            className="relative grid size-5 place-items-center p-0"
            variant="ghost"
            type="button"
          >
            <ShoppingCart className="size-icon-md stroke-icon" />
            <span className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-primary text-tiny-medium text-ink">
              6
            </span>
          </Button>
          {status === 'authenticated' ? (
            <Button
              className="grid h-header-actions rounded-md border border-primary px-3 text-xs text-primary"
              variant="ghost"
              type="button"
              onClick={clear}
              aria-label="Sair da conta"
            >
              Sair{user ? ` · ${user.name}` : ''}
            </Button>
          ) : (
            <Button
              className="hidden h-header-actions w-login-width place-items-center rounded-md bg-primary text-body-16-medium text-ink transition-colors hover:bg-primary-light sm:grid"
              variant="primary"
              onClick={() => openAuthModal('login', location.pathname)}
            >
              Entrar
            </Button>
          )}
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
