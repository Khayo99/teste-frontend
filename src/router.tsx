import { Link, Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { HomePage } from '@/features/home/home-page'

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
      <Link className="mt-6 inline-block underline" to="/">Voltar ao início</Link>
    </section>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
