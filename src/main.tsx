import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { queryClient } from '@/lib/query-client'
import { enableMocking } from '@/mocks/enable'
import { realtimeClient } from '@/lib/realtime'
import { router } from '@/router'

void enableMocking().finally(() => {
  realtimeClient.connect()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
