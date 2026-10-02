import { HttpResponse, http, type RequestHandler } from 'msw'
import { catalogNfts } from '@/features/catalog/data/catalog-fixtures'

export const handlers: RequestHandler[] = [
  http.get('/api/nfts', () => HttpResponse.json({ items: catalogNfts })),
]
