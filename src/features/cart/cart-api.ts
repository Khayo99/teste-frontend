import axios from 'axios'
import type { CartItem } from '@/features/cart/cart-store'
import { api } from '@/lib/api'

export type CartQuoteItem = Pick<CartItem, 'editionId' | 'id'> & { availability: number; priceEth: string }
export type CartQuote = {
  coupon: { code: string; discountEth: string } | null
  items: CartQuoteItem[]
  totals: { discountEth: string; networkFeeEth: string; subtotalEth: string; totalEth: string }
}

export class CartApiError extends Error {
  constructor(message: string, public status?: number) { super(message); this.name = 'CartApiError' }
}

const cartLines = (items: CartItem[]) => items.map(({ id, editionId, quantity }) => ({ id, editionId, quantity }))
function toCartError(error: unknown) {
  if (axios.isAxiosError(error)) return new CartApiError((error.response?.data as { message?: string } | undefined)?.message ?? 'Não foi possível atualizar o carrinho.', error.response?.status)
  return new CartApiError('Não foi possível atualizar o carrinho.')
}
export async function getCartQuote(items: CartItem[], coupon: string | null, signal?: AbortSignal) {
  try { return (await api.post<CartQuote>('/cart/quote', { items: cartLines(items), coupon }, { signal })).data } catch (error) { throw toCartError(error) }
}
export async function validateCoupon(code: string) {
  try { return (await api.post<{ coupon: { code: string } }>('/cart/coupons', { code })).data.coupon } catch (error) { throw toCartError(error) }
}
