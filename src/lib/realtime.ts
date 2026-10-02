import { io } from 'socket.io-client'

// Shared client for catalog updates; subscriptions are added by resource hooks as flows are implemented.
export const realtimeClient = io('/realtime', { autoConnect: false })

export function startSessionRealtime(token: string) { realtimeClient.auth = { token }; realtimeClient.connect() }
export function endSessionRealtime() { realtimeClient.removeAllListeners(); if (realtimeClient.connected) realtimeClient.disconnect(); realtimeClient.auth = {} }
