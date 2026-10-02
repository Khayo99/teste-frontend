import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export function clearPrivateCache() { queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === 'private' || query.queryKey[0] === 'auth' }) }
