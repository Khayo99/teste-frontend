/* eslint-disable react-refresh/only-export-components -- route tree registration exports non-components by design. */
import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect
} from '@tanstack/react-router'
import { lazy, Suspense, type ReactNode } from 'react'
import { HomePage } from '@/features/home/home-page'
import { AuthenticatedRoute } from '@/components/authenticated-route'
import { AppLayout } from '@/components/app-layout'
import type {
  CatalogCategory,
  CatalogNetwork,
  CatalogSearch,
  CatalogSort,
  CatalogTab
} from '@/@types/catalog'

const AuthPage = lazy(async () => ({
  default: (await import('@/features/auth/auth-page')).AuthPage
}))
const NftDetailPage = lazy(async () => ({
  default: (await import('@/features/nft-detail/nft-detail-page')).NftDetailPage
}))
const AccountPage = lazy(async () => ({
  default: (await import('@/features/account/account-page')).AccountPage
}))
const CartPage = lazy(async () => ({
  default: (await import('@/features/cart/cart-page')).CartPage
}))
const CheckoutPage = lazy(async () => ({
  default: (await import('@/features/orders/checkout-page')).CheckoutPage
}))
const OrdersPage = lazy(async () => ({
  default: (await import('@/features/orders/orders-page')).OrdersPage
}))
const FavoritesPage = lazy(async () => ({
  default: (await import('@/features/nft-detail/favorites-page')).FavoritesPage
}))

function DeferredPage({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <Suspense fallback={fallback ?? <PageSkeleton />}>{children}</Suspense>
}

function PageSkeleton() {
  return <div aria-busy="true" aria-label="Carregando página" className="space-y-6" role="status"><span className="sr-only">Carregando página</span><div className="skeleton h-5 w-40 rounded" /><div className="skeleton h-80 rounded-2xl" /><div className="skeleton h-6 w-2/3 rounded" /><div className="skeleton h-5 w-full rounded" /></div>
}

function DetailRouteSkeleton() {
  return <div aria-busy="true" aria-label="Carregando NFT" role="status"><span className="sr-only">Carregando NFT</span><div className="md:hidden"><div className="-mb-value-114 h-value-506 bg-nft-gallery-mobile p-7 pt-value-23"><div className="skeleton size-value-35 rounded-full" /><div className="skeleton mt-2 h-value-356 rounded-value-24" /></div><div className="min-h-value-504 rounded-t-value-31 bg-surface-card px-6 pt-8"><div className="skeleton h-5 w-3/5 rounded" /><div className="skeleton mt-5 h-4 w-full rounded" /><div className="skeleton mt-2 h-4 w-4/5 rounded" /></div></div><div className="hidden space-y-7 md:block"><div className="skeleton h-4 w-40 rounded" /><div className="grid gap-12 lg:grid-cols-2"><div className="skeleton aspect-square rounded-2xl" /><div className="space-y-6"><div className="skeleton h-9 w-2/3 rounded" /><div className="skeleton h-5 w-full rounded" /><div className="skeleton h-5 w-4/5 rounded" /><div className="skeleton h-10 w-full rounded" /></div></div></div></div>
}

function CartRouteSkeleton() {
  return <div aria-busy="true" aria-label="Carregando carrinho" role="status"><span className="sr-only">Carregando carrinho</span><div className="space-y-5 sm:hidden"><div className="skeleton h-6 w-48 rounded" /><div className="skeleton h-value-100 rounded-value-14" /><div className="skeleton h-value-100 rounded-value-14" /><div className="skeleton h-5 w-full rounded" /><div className="skeleton h-5 w-full rounded" /></div><div className="-mt-16 hidden grid gap-10 xl:grid-cols-cart-layout sm:grid"><div className="space-y-3"><div className="skeleton h-7 w-full rounded" /><div className="skeleton h-value-70 w-full rounded" /><div className="skeleton h-value-70 w-full rounded" /></div><div className="space-y-4"><div className="skeleton h-7 w-full rounded" /><div className="skeleton h-10 w-full rounded" /><div className="skeleton h-5 w-full rounded" /><div className="skeleton h-5 w-full rounded" /><div className="skeleton h-10 w-full rounded" /></div></div></div>
}

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
const sorts: CatalogSort[] = ['recent', 'price-asc', 'price-desc']
const tabs: CatalogTab[] = ['all', 'new', 'trending']

const numberSearch = (value: unknown, fallback: number, minimum: number) => {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) && number >= minimum ? number : fallback
}

const validateCatalogSearch = (
  search: Record<string, unknown>
): CatalogSearch => {
  const minPrice = numberSearch(search.minPrice, 0.02, 0)
  const maxPrice = Math.max(minPrice, numberSearch(search.maxPrice, 12.3, 0))
  return {
    category:
      typeof search.category === 'string' &&
      categories.includes(search.category as CatalogCategory)
        ? (search.category as CatalogCategory)
        : null,
    network:
      typeof search.network === 'string' &&
      networks.includes(search.network as CatalogNetwork)
        ? (search.network as CatalogNetwork)
        : null,
    search: typeof search.search === 'string' ? search.search : '',
    sort:
      typeof search.sort === 'string' &&
      sorts.includes(search.sort as CatalogSort)
        ? (search.sort as CatalogSort)
        : 'recent',
    tab:
      typeof search.tab === 'string' && tabs.includes(search.tab as CatalogTab)
        ? (search.tab as CatalogTab)
        : 'all',
    page: Math.floor(numberSearch(search.page, 1, 1)),
    minPrice,
    maxPrice
  }
}

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  notFoundComponent: () => (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-bold">Página não encontrada</h1>
      <Link className="mt-6 inline-block underline" to="/">
        Voltar ao início
      </Link>
    </section>
  )
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: validateCatalogSearch,
  component: HomePage
})

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$nftId',
  component: () => <DeferredPage fallback={<DetailRouteSkeleton />}><NftDetailPage /></DeferredPage>
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: typeof search.returnTo === 'string' ? search.returnTo : undefined
  }),
  component: () => <DeferredPage><AuthPage mode="login" background={false} /></DeferredPage>
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: typeof search.returnTo === 'string' ? search.returnTo : undefined
  }),
  component: () => <DeferredPage><AuthPage mode="register" background={false} /></DeferredPage>
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  nftDetailRoute,
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/cart',
    component: () => <DeferredPage fallback={<CartRouteSkeleton />}><CartPage /></DeferredPage>
  }),

  loginRoute,
  registerRoute,

  createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    beforeLoad: () => {
      if (!localStorage.getItem('kurio.auth.session'))
        throw redirect({ to: '/login', search: { returnTo: '/profile' } })
    },
    component: () => (
      <AuthenticatedRoute>
        <DeferredPage><AccountPage section="profile" /></DeferredPage>
      </AuthenticatedRoute>
    )
  }),

  createRoute({
    getParentRoute: () => rootRoute,
    path: '/wallets',
    beforeLoad: () => {
      if (!localStorage.getItem('kurio.auth.session'))
        throw redirect({ to: '/login', search: { returnTo: '/wallets' } })
    },
    component: () => (
      <AuthenticatedRoute>
        <DeferredPage><AccountPage section="wallets" /></DeferredPage>
      </AuthenticatedRoute>
    )
  }),

  createRoute({
    getParentRoute: () => rootRoute,
    path: '/favorites',
    beforeLoad: () => {
      if (!localStorage.getItem('kurio.auth.session'))
        throw redirect({ to: '/login', search: { returnTo: '/favorites' } })
    },
    component: () => (
      <AuthenticatedRoute>
        <DeferredPage><FavoritesPage /></DeferredPage>
      </AuthenticatedRoute>
    )
  }),

  createRoute({
    getParentRoute: () => rootRoute,
    path: '/checkout',
    beforeLoad: () => {
      if (!localStorage.getItem('kurio.auth.session'))
        throw redirect({ to: '/login', search: { returnTo: '/checkout' } })
    },
    component: () => (
      <AuthenticatedRoute>
        <DeferredPage><CheckoutPage /></DeferredPage>
      </AuthenticatedRoute>
    )
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/orders',
    beforeLoad: () => {
      if (!localStorage.getItem('kurio.auth.session'))
        throw redirect({ to: '/login', search: { returnTo: '/orders' } })
    },
    component: () => (
      <AuthenticatedRoute>
        <DeferredPage><OrdersPage /></DeferredPage>
      </AuthenticatedRoute>
    )
  })
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
