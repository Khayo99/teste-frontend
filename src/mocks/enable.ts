export async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW === 'false') return

  const { worker } = await import('./browser')
  await worker.start({
    onUnhandledFrame: 'bypass',
  })
}
