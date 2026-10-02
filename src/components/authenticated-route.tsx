import { Navigate, useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/auth-store'

export function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuthStore()
  const location = useLocation()
  if (status === 'loading')
    return (
      <div className="grid min-h-screen place-items-center text-text-secondary">
        Validando sessão…
      </div>
    )
  if (status !== 'authenticated')
    return (
      <Navigate to="/login" search={{ returnTo: location.pathname }} replace />
    )
  return children
}
