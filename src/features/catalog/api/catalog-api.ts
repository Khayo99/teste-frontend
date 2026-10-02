import type { Nft } from '@/@types/catalog'
import { api } from '@/lib/api'

export async function getCatalogNfts() {
  const response = await api.get<{ items: Nft[] }>('/nfts')

  if (!Array.isArray(response.data?.items)) {
    throw new Error('A API do catálogo retornou uma resposta inválida.')
  }

  return response.data.items
}
