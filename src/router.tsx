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

function DeferredPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div aria-label="Carregando página" role="status" />}>{children}</Suspense>
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
  component: () => <DeferredPage><NftDetailPage /></DeferredPage>
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
    component: () => <DeferredPage><CartPage /></DeferredPage>
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
