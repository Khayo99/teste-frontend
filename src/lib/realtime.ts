import { io } from 'socket.io-client'
import type { QueryClient } from '@tanstack/react-query'
import { nftUpdateEventSchema, orderUpdateEventSchema } from './contracts'

// Shared client for catalog updates; subscriptions are added by resource hooks as flows are implemented.
// The mock binding supports Socket.IO's default namespace and text frames only.
// Keeping the application on the default namespace also makes its transport
// compatible with a production Socket.IO server.
export const realtimeClient = io({ path: '/realtime/socket.io', transports: ['websocket'], autoConnect: false })
const versions = new Map<string, number>()
let installed = false

/** Event payloads are validated and monotonically applied before cache reconciliation. */
export function installRealtimeCacheSync(queryClient: QueryClient) {
  if (installed) return
  installed = true
  realtimeClient.on('nft.updated', payload => {
    const parsed = nftUpdateEventSchema.safeParse({ type: 'nft.updated', ...payload })
    if (!parsed.success) return
    const event = parsed.data
    if ((versions.get(event.nftId) ?? -1) >= event.version) return
    versions.set(event.nftId, event.version)
    void queryClient.invalidateQueries({ queryKey: ['public'] })
    void queryClient.invalidateQueries({ queryKey: ['nft', event.nftId] })
    void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
  })
  realtimeClient.on('connect', () => {
    void queryClient.invalidateQueries({ queryKey: ['public'] })
    void queryClient.invalidateQueries({ queryKey: ['cart-quote'] })
  })
  realtimeClient.on('order.updated', payload => {
    const parsed = orderUpdateEventSchema.safeParse({ type: 'order.updated', ...payload })
    if (!parsed.success) return
    const event = parsed.data
    const versionKey = `order:${event.userId}:${event.orderId}`
    if ((versions.get(versionKey) ?? -1) >= event.version) return
    versions.set(versionKey, event.version)
    void queryClient.invalidateQueries({ queryKey: ['private', event.userId, 'orders'] })
  })
}

export function startSessionRealtime(token: string) {
  realtimeClient.auth = { token }
  realtimeClient.connect()
  realtimeClient.once('connect', () => realtimeClient.emit('session.identify', { token }))
}
// Resource hooks unregister their own listeners on unmount. Keeping the cache
// synchronizer installed makes a subsequent login safe without duplicating it.
export function endSessionRealtime() {
  versions.clear()
  if (realtimeClient.connected) realtimeClient.disconnect()
  realtimeClient.auth = {}
}
