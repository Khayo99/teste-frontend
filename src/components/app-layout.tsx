import type { ReactNode } from 'react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { AuthPage } from '@/features/auth/auth-page'
import { useAuthStore } from '@/features/auth/auth-store'
import { useLocation } from '@tanstack/react-router'

export function AppLayout({ children }: { children: ReactNode }) {
  const { authModal, closeAuthModal } = useAuthStore()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isNftDetailPage = location.pathname.startsWith('/nft/')
  const usesMobileScreenLayout = isHomePage || isNftDetailPage || location.pathname === '/cart' || location.pathname === '/checkout'
  return (
    <div className={`min-h-screen overflow-x-clip bg-ink text-text-primary ${isNftDetailPage ? 'px-0 py-0 sm:px-8 sm:py-6 xl:px-layout-gutter' : 'px-4 py-5 sm:px-8 sm:py-6 xl:px-layout-gutter'}`}>
      <div className="mx-auto flex max-w-layout-content flex-col gap-16 sm:gap-24">
        <Header />
        {children}
        <div className={usesMobileScreenLayout ? 'hidden md:block' : ''}><Footer /></div>
      </div>

      {authModal.open && (
        <AuthPage
          mode={authModal.mode}
          background={false}
          returnTo={authModal.returnTo ?? undefined}
          onClose={closeAuthModal}
        />
      )}
    </div>
  )
}
