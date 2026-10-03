import { io } from 'socket.io-client'
import type { QueryClient } from '@tanstack/react-query'
import {
  nftUpdateEventSchema,
  orderUpdateEventSchema,
  type NftUpdateEvent,
  type OrderUpdateEvent
} from './contracts'

// Feature views subscribe to the validated streams below instead of directly
// to Socket.IO. This gives every screen the same duplicate/old-frame policy.
export const realtimeClient = io({
  path: '/realtime/socket.io',
  transports: ['websocket'],
  autoConnect: false
})

const versions = new Map<string, number>()
const nftSubscribers = new Set<(event: NftUpdateEvent) => void>()
const orderSubscribers = new Set<(event: OrderUpdateEvent) => void>()
let installed = false
let activeUserId: string | null = null
let activeToken: string | null = null

const isNewer = (key: string, version: number) => {
  if ((versions.get(key) ?? -1) >= version) return false
  versions.set(key, version)
  return true
}

export const isTerminalOrder = (status: OrderUpdateEvent['status']) =>
  status === 'confirmed' || status === 'declined'

export function subscribeToNftUpdates(listener: (event: NftUpdateEvent) => void) {
  nftSubscribers.add(listener)
  return () => {
    nftSubscribers.delete(listener)
  }
}

export function subscribeToOrderUpdates(listener: (event: OrderUpdateEvent) => void) {
  orderSubscribers.add(listener)
  return () => {
    orderSubscribers.delete(listener)
  }
}

/** Validates and orders events before cache reconciliation or UI side effects. */
export function installRealtimeCacheSync(queryClient: QueryClient) {
  if (installed) return
  installed = true
  realtimeClient.on('nft.updated', payload => {
    const parsed = nftUpdateEventSchema.safeParse({ type: 'nft.updated', ...payload })
    if (!parsed.success || !isNewer(`nft:${parsed.data.nftId}`, parsed.data.version)) return
    const event = parsed.data
    nftSubscribers.forEach(listener => listener(event))
    void queryClient.invalidateQueries({ queryKey: ['public'] })
    void queryClient.invalidateQueries({ queryKey: ['nft', event.nftId] })
    void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
  })
  realtimeClient.on('order.updated', payload => {
    const parsed = orderUpdateEventSchema.safeParse({ type: 'order.updated', ...payload })
    if (!parsed.success || parsed.data.userId !== activeUserId) return
    const event = parsed.data
    if (!isNewer(`order:${event.userId}:${event.orderId}`, event.version)) return
    orderSubscribers.forEach(listener => listener(event))
    void queryClient.invalidateQueries({ queryKey: ['private', event.userId, 'orders'] })
  })
  realtimeClient.on('connect', () => {
    // REST is authoritative after transport recovery, including a reload while
    // an order was pending.
    void queryClient.invalidateQueries({ queryKey: ['public'] })
    void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
    if (activeUserId)
      void queryClient.invalidateQueries({ queryKey: ['private', activeUserId] })
  })
}

export function startSessionRealtime(token: string, userId: string) {
  if (activeToken !== token || activeUserId !== userId) {
    realtimeClient.disconnect()
    versions.clear()
  }
  activeToken = token
  activeUserId = userId
  realtimeClient.auth = { token }
  realtimeClient.once('connect', () => realtimeClient.emit('session.identify', { token }))
  realtimeClient.connect()
}

export function endSessionRealtime() {
  activeToken = null
  activeUserId = null
  versions.clear()
  realtimeClient.disconnect()
  realtimeClient.auth = {}
}
