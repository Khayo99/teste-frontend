const START_TIMEOUT_MS = 4_000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(new Error(`${label} excedeu ${timeoutMs}ms`)),
        timeoutMs
      )
    })
  ])
}

export async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW === 'false') return

  try {
    const { worker } = await import('./browser')
    const controls = await import('./handlers')
    await withTimeout(
      worker.start({ onUnhandledRequest: 'bypass' }),
      START_TIMEOUT_MS,
      'Inicialização do Mock Service Worker'
    )
    if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true') {
      const { realtimeClient } = await import('@/lib/realtime')
      Object.assign(window, {
        __KURIO_MOCKS__: {
          reset: controls.resetMockScenario,
          configure: controls.configureMockScenario,
          failNext: controls.failNextMockRequest,
          updateNft: controls.updateMockNft,
          emitNftUpdate: controls.emitMockNftUpdate,
          emitOrderUpdate: controls.emitMockOrderUpdate,
          confirmOrder: controls.confirmMockOrder,
          disconnectRealtime: () => realtimeClient.disconnect(),
          reconnectRealtime: () => realtimeClient.connect()
        }
      })
    }
  } catch (error) {
    // Nunca deixar uma falha ou travamento do worker impedir a renderização do app.
    console.error(
      'Mock Service Worker não pôde ser iniciado; a aplicação continuará sem mocks de API.',
      error
    )
  }
}
