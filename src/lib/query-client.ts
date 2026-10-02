import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const status = typeof error === 'object' && error && 'status' in error
          ? Number((error as { status?: number }).status) : undefined
        return failureCount < 2 && (!status || status >= 500)
      },
      retryDelay: attempt => Math.min(1_000 * 2 ** attempt, 4_000),
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export function clearPrivateCache() {
  void queryClient.cancelQueries({ predicate: query => query.queryKey[0] === 'private' || query.queryKey[0] === 'nft' })
  queryClient.removeQueries({ predicate: query => query.queryKey[0] === 'private' || query.queryKey[0] === 'nft' || query.queryKey[0] === 'auth' })
}
