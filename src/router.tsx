import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect
} from '@tanstack/react-router'
import { HomePage } from '@/features/home/home-page'
import { AuthPage } from '@/features/auth/auth-page'
import { ProtectedPage } from '@/features/auth/protected-pages'
import { AuthenticatedRoute } from '@/components/authenticated-route'

const rootRoute = createRootRoute({
  component: () => (
    <main className="min-h-screen bg-background text-foreground">
      <Outlet />
    </main>
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
  component: HomePage
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: typeof search.returnTo === 'string' ? search.returnTo : undefined
  }),
  component: () => <AuthPage mode="login" />
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: typeof search.returnTo === 'string' ? search.returnTo : undefined
  }),
  component: () => <AuthPage mode="register" />
})

const protectedRoute = (
  path: '/checkout' | '/profile' | '/wallets' | '/favorites' | '/orders',
  title: string
) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      if (!localStorage.getItem('kurio.auth.session'))
        throw redirect({ to: '/login', search: { returnTo: path } })
    },
    component: () => (
      <AuthenticatedRoute>
        <ProtectedPage title={title} />
      </AuthenticatedRoute>
    )
  })

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  protectedRoute('/checkout', 'Checkout'),
  protectedRoute('/profile', 'Seu perfil'),
  protectedRoute('/wallets', 'Carteiras'),
  protectedRoute('/favorites', 'Favoritos'),
  protectedRoute('/orders', 'Pedidos')
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
