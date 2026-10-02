import axios from 'axios'
import { api } from '@/lib/api'
import type { CartItem } from '@/features/cart/cart-store'
import type { CartQuote } from '@/features/cart/cart-api'

export type OrderStatus = 'pending' | 'confirmed' | 'declined'
export type Order = { id: string; userId: string; status: OrderStatus; version: number; receipt: CartQuote; createdAt: string; reason?: string }

export class OrderApiError extends Error { constructor(message: string, public status?: number) { super(message) } }
const lines = (items: CartItem[]) => items.map(({ id, editionId, quantity }) => ({ id, editionId, quantity }))
const error = (cause: unknown) => axios.isAxiosError(cause)
  ? new OrderApiError((cause.response?.data as { message?: string } | undefined)?.message ?? 'Não foi possível enviar o pedido.', cause.response?.status)
  : new OrderApiError('Não foi possível enviar o pedido.')

export async function createOrder(items: CartItem[], coupon: string | null, quote: CartQuote, idempotencyKey: string) {
  try { return (await api.post<{ order: Order }>('/orders', { items: lines(items), coupon, quote }, { headers: { 'Idempotency-Key': idempotencyKey } })).data.order } catch (cause) { throw error(cause) }
}
export async function getOrder(id: string) { try { return (await api.get<{ order: Order }>(`/orders/${id}`)).data.order } catch (cause) { throw error(cause) } }
export async function getOrders() { try { return (await api.get<{ orders: Order[] }>('/orders')).data.orders } catch (cause) { throw error(cause) } }
