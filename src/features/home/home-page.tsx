import { HomeCatalog } from './components/home-catalog'
import { HomeDiscovery } from './components/home-discovery'
import { HomeHero } from './components/home-hero'
import { Link } from '@tanstack/react-router'
import tabBarShape from '@/assets/home/mobile-tabbar-shape.svg'
import tabBarOrb from '@/assets/home/mobile-tabbar-orb.svg'
import tabBarHome from '@/assets/home/mobile-tabbar-figma-home.svg'
import tabBarHeart from '@/assets/home/mobile-tabbar-figma-heart.svg'
import tabBarShop from '@/assets/home/mobile-tabbar-figma-shop.svg'
import tabBarUser from '@/assets/home/mobile-tabbar-figma-user.svg'
import centerOne from '@/assets/home/mobile-tabbar-center-1.svg'
import centerTwo from '@/assets/home/mobile-tabbar-center-2.svg'
import centerThree from '@/assets/home/mobile-tabbar-center-3.svg'
import centerFour from '@/assets/home/mobile-tabbar-center-4.svg'
import centerFive from '@/assets/home/mobile-tabbar-center-5.svg'

export function HomePage() {
  return (
    <>
      <div className="px-2 pt-1 pb-24 md:-mt-16 md:px-0 md:pt-0 md:pb-0">
        <HomeHero />
        <HomeCatalog />
        <HomeDiscovery />
      </div>
      <MobileBottomNavigation />
    </>
  )
}

function MobileBottomNavigation() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 h-value-126 overflow-hidden md:hidden"
    >
      <img
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 -top-value-9 max-w-none -translate-x-1/2"
        src={tabBarShape}
      />
      <Link
        aria-label="Início"
        className="absolute left-value-8-7-percent top-value-71 grid size-5 place-items-center"
        to="/"
      >
        <img alt="" src={tabBarHome} />
      </Link>
      <Link
        aria-label="Favoritos"
        className="absolute left-value-26-09-percent top-value-72 grid size-5 place-items-center"
        to="/favorites"
      >
        <img alt="" src={tabBarHeart} />
      </Link>
      <Link
        aria-label="Carrinho"
        className="absolute left-value-70-53-percent top-value-71 grid size-5 place-items-center"
        to="/cart"
      >
        <img alt="" src={tabBarShop} />
      </Link>
      <Link
        aria-label="Perfil"
        className="absolute left-value-85-51-percent top-value-71 grid size-5 place-items-center"
        to="/profile"
      >
        <img alt="" src={tabBarUser} />
      </Link>
      <a
        aria-label="Explorar NFTs"
        className="absolute left-1/2 top-0 block size-value-65 -translate-x-1/2"
        href="#mercado"
      >
        <img alt="" aria-hidden="true" src={tabBarOrb} />
        <img
          alt=""
          aria-hidden="true"
          className="absolute left-value-19 top-value-32"
          src={centerOne}
        />
        <img
          alt=""
          aria-hidden="true"
          className="absolute left-value-20 top-value-35"
          src={centerTwo}
        />
        <img
          alt=""
          aria-hidden="true"
          className="absolute left-value-34 top-value-21"
          src={centerThree}
        />
        <img
          alt=""
          aria-hidden="true"
          className="absolute left-value-34 top-value-35"
          src={centerFour}
        />
        <img
          alt=""
          aria-hidden="true"
          className="absolute left-value-20 top-value-21"
          src={centerFive}
        />
      </a>
    </nav>
  )
}
