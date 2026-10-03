import axios from 'axios'
import type { CartItem } from '@/features/cart/cart-store'
import { api } from '@/lib/api'

export type CartQuoteItem = Pick<CartItem, 'editionId' | 'id'> & { availability: number; priceEth: string; quantity: number }
export type CartQuote = {
  coupon: { code: string; discountEth: string } | null
  items: CartQuoteItem[]
  totals: { discountEth: string; networkFeeEth: string; subtotalEth: string; totalEth: string }
}
export type CartResponse = {
  items: CartItem[]
  coupon: string | null
  revision: number
}

export class CartApiError extends Error {
  constructor(message: string, public status?: number) { super(message); this.name = 'CartApiError' }
}

const cartLines = (items: CartItem[]) => items.map(({ id, editionId, quantity }) => ({ id, editionId, quantity }))
const visitorKey = 'kurio.cart.visitor-id'
export function getVisitorId() {
  const current = localStorage.getItem(visitorKey)
  if (current) return current
  const created = `visitor-${crypto.randomUUID()}`
  localStorage.setItem(visitorKey, created)
  return created
}
function scopeHeaders() {
  const session = JSON.parse(localStorage.getItem('kurio.auth.session') ?? 'null') as { token?: string } | null
  return { Authorization: `Bearer ${session?.token ?? ''}`, 'X-Cart-Id': getVisitorId() }
}
function toCartError(error: unknown) {
  if (axios.isAxiosError(error)) return new CartApiError((error.response?.data as { message?: string } | undefined)?.message ?? 'Não foi possível atualizar o carrinho.', error.response?.status)
  return new CartApiError('Não foi possível atualizar o carrinho.')
}
export async function getCartQuote(items: CartItem[], coupon: string | null, signal?: AbortSignal) {
  try { return (await api.post<CartQuote>('/cart/quote', { items: cartLines(items), coupon }, { signal })).data } catch (error) { throw toCartError(error) }
}
export async function getCart(signal?: AbortSignal) {
  try { return (await api.get<CartResponse>('/cart', { headers: scopeHeaders(), signal })).data } catch (error) { throw toCartError(error) }
}
export async function addCartItem(item: Pick<CartItem, 'id' | 'editionId' | 'quantity'>) {
  try { return (await api.post<CartResponse>('/cart/items', item, { headers: scopeHeaders() })).data } catch (error) { throw toCartError(error) }
}
export async function updateCartLine(lineId: string, quantity: number) {
  try { return (await api.patch<CartResponse>(`/cart/items/${encodeURIComponent(lineId)}`, { quantity }, { headers: scopeHeaders() })).data } catch (error) { throw toCartError(error) }
}
export async function removeCartLine(lineId: string) {
  try { return (await api.delete<CartResponse>(`/cart/items/${encodeURIComponent(lineId)}`, { headers: scopeHeaders() })).data } catch (error) { throw toCartError(error) }
}
export async function removeCartCoupon() {
  try { return (await api.delete<CartResponse>('/cart/coupon', { headers: scopeHeaders() })).data } catch (error) { throw toCartError(error) }
}
export async function mergeVisitorCart() {
  try { return (await api.post<CartResponse & { adjustments: string[] }>('/cart/merge', { visitorId: getVisitorId() }, { headers: scopeHeaders() })).data } catch (error) { throw toCartError(error) }
}
export async function validateCoupon(code: string) {
  try {
    const response = await api.put<CartResponse>('/cart/coupon', { code }, { headers: scopeHeaders() })
    return { code: response.data.coupon ?? code.trim().toUpperCase() }
  } catch (error) { throw toCartError(error) }
}
