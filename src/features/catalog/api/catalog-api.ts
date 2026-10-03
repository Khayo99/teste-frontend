import type { CatalogQuery, Nft } from '@/@types/catalog'
import { api } from '@/lib/api'

export async function getCatalogNfts(
  query: CatalogQuery,
  signal?: AbortSignal
) {
  const response = await api.get<{ items: Nft[]; totalItems?: number; totalPages?: number }>('/nfts', {
    signal,
    params: {
      search: query.search || undefined,
      category: query.category || undefined,
      network: query.network || undefined,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize
    }
  })

  if (!Array.isArray(response.data?.items)) {
    throw new Error('A API do catálogo retornou uma resposta inválida.')
  }

  return {
    items: response.data.items,
    totalItems: response.data.totalItems ?? response.data.items.length,
    totalPages: response.data.totalPages ?? 1
  }
}
