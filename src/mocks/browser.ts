import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// Atualiza os handlers sem exigir que quem está com o Vite aberto reinicie a
// aplicação. Sem isso, um endpoint adicionado durante o desenvolvimento pode
// continuar retornando 404 até um reload completo da página.
if (import.meta.hot) {
  import.meta.hot.accept('./handlers', module => {
    if (module) worker.resetHandlers(...module.handlers)
  })
}
