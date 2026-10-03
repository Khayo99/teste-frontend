import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { queryClient } from '@/lib/query-client'
import { enableMocking } from '@/mocks/enable'
import { router } from '@/router'
import { getSession } from '@/features/auth/api/auth-api'
import { storedSession, useAuthStore } from '@/features/auth/auth-store'
import { installRealtimeCacheSync } from '@/lib/realtime'

void enableMocking().then(async () => {
  installRealtimeCacheSync(queryClient)
  const stored = storedSession()
  if (!stored) useAuthStore.getState().clear()
  else {
    try {
      useAuthStore.getState().setSession(await getSession(stored.token))
    } catch {
      useAuthStore.getState().clear()
    }
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  )
})
