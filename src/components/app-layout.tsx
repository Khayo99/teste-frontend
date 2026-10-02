import type { ReactNode } from 'react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { AuthPage } from '@/features/auth/auth-page'
import { useAuthStore } from '@/features/auth/auth-store'

export function AppLayout({ children }: { children: ReactNode }) {
  const { authModal, closeAuthModal } = useAuthStore()
  return (
    <div className="min-h-screen bg-ink px-5 py-6 text-text-primary sm:px-8 xl:px-layout-gutter">
      <div className="mx-auto flex max-w-layout-content flex-col gap-24">
        <Header />
        {children}
        <Footer />
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
