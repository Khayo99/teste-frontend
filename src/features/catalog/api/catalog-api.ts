import type { Nft } from '@/@types/catalog'
import { api } from '@/lib/api'

export async function getCatalogNfts() {
  const response = await api.get<{ items: Nft[] }>('/nfts')
  return response.data.items
}
