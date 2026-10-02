import { HomeCatalog } from './components/home-catalog'
import { HomeDiscovery } from './components/home-discovery'
import { HomeFooter } from './components/home-footer'
import { HomeHeader } from './components/home-header'
import { HomeHero } from './components/home-hero'

export function HomePage() {
  return (
    <div className="min-h-screen bg-ink px-5 py-6 text-text-primary sm:px-8 xl:px-layout-gutter">
      <main className="mx-auto flex max-w-layout-content flex-col gap-24">
        <div className="flex flex-col gap-8">
          <HomeHeader />
          <HomeHero />
        </div>
        <HomeCatalog />
        <HomeDiscovery />
        <HomeFooter />
      </main>
    </div>
  )
}
