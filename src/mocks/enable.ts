const START_TIMEOUT_MS = 4_000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(new Error(`${label} excedeu ${timeoutMs}ms`)),
        timeoutMs,
      )
    }),
  ])
}

export async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW === 'false') return

  try {
    const { worker } = await import('./browser')
    const controls = await import('./handlers')
    await withTimeout(
      worker.start({ onUnhandledFrame: 'bypass' }),
      START_TIMEOUT_MS,
      'Inicialização do Mock Service Worker',
    )
    if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true') {
      Object.assign(window, { __KURIO_MOCKS__: { reset: controls.resetMockScenario, updateNft: controls.updateMockNft } })
    }
  } catch (error) {
    // Nunca deixar uma falha ou travamento do worker impedir a renderização do app.
    console.error(
      'Mock Service Worker não pôde ser iniciado; a aplicação continuará sem mocks de API.',
      error,
    )
  }
}
