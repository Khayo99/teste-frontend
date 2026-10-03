import 'vite/client'

type KurioMockScenario =
  | 'success'
  | 'offline'
  | 'server-error'
  | 'slow'
  | 'variable-latency'
  | 'payment-declined'
  | 'payment-pending'
  | 'order-timeout'

declare global {
  interface Window {
    __KURIO_MOCKS__?: {
      reset: () => void
      configure: (config: Partial<{
        scenario: KurioMockScenario
        latencyMs: number
        now: string | null
        autoConfirmPendingOrders: boolean
      }>) => void
      failNext: (failure: { path: string; status?: number; networkError?: boolean }) => void
      updateNft: (id: string, update: { priceEth?: string; availability?: number }) => unknown
      emitNftUpdate: (payload: { nftId: string; priceEth: string; availability: number; version: number }) => void
      emitOrderUpdate: (payload: { orderId: string; userId: string; status: 'pending' | 'confirmed' | 'declined'; version: number; reason?: string; transactionReference?: string }) => void
      confirmOrder: (id: string) => unknown
      disconnectRealtime: () => void
      reconnectRealtime: () => void
    }
  }
}
