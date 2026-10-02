import { Menu, Search, ShoppingCart } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/features/auth/auth-store'

export function HomeHeader() {
  const { status, user, clear } = useAuthStore()
  return (
    <header className="relative h-header-height border-b border-border">
      <div className="flex h-header-inner items-start justify-between">
        <a className="pt-2 text-body-14-brand text-text-primary" href="/">
          KURIO
        </a>
        <nav
          aria-label="Principal"
          className="hidden h-header-inner items-start gap-10 text-body-16 md:flex xl:absolute xl:left-header-nav-offset"
        >
          <a
            aria-current="page"
            className="h-header-height border-b-2 border-text-accent font-bold text-text-accent"
            href="/"
          >
            Início
          </a>
          <a
            className="transition-colors hover:text-text-accent"
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
        <div className="flex h-header-actions items-center gap-7 text-text-primary">
          <button
            aria-label="Buscar"
            className="grid size-5 place-items-center"
            type="button"
          >
            <Search className="size-icon-md stroke-icon" />
          </button>
          <button
            aria-label="Carrinho"
            className="relative grid size-5 place-items-center"
            type="button"
          >
            <ShoppingCart className="size-icon-md stroke-icon" />
            <span className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-primary text-tiny-medium text-ink">
              6
            </span>
          </button>
          {status === 'authenticated' ? <button className="grid h-header-actions items-center rounded-md border border-primary px-3 text-xs text-primary" type="button" onClick={clear} aria-label="Sair da conta">Sair{user ? ` · ${user.name}` : ''}</button> : <Link
            className="hidden h-header-actions w-login-width place-items-center rounded-md bg-primary text-body-16-medium text-ink transition-colors hover:bg-primary-light sm:grid"
            to="/login"
            search={{ returnTo: undefined }}
          >
            Entrar
          </Link>}
          <button
            aria-label="Abrir navegação"
            className="grid size-5 place-items-center md:hidden"
            type="button"
          >
            <Menu className="size-icon-lg" />
          </button>
        </div>
      </div>
    </header>
  )
}
