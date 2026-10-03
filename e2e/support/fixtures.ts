import { expect, test as base, type Page } from '@playwright/test'

type MockControls = {
  configure: (config: {
    scenario?: string
    latencyMs?: number
    now?: string | null
    autoConfirmPendingOrders?: boolean
  }) => Promise<void>
  failNext: (failure: {
    path: string
    status?: number
    networkError?: boolean
  }) => Promise<void>
  updateNft: (
    id: string,
    update: { priceEth?: string; availability?: number }
  ) => Promise<void>
  emitNftUpdate: (payload: {
    nftId: string
    priceEth: string
    availability: number
    version: number
  }) => Promise<void>
  emitOrderUpdate: (payload: {
    orderId: string
    userId: string
    status: 'pending' | 'confirmed' | 'declined'
    version: number
  }) => Promise<void>
  confirmOrder: (id: string) => Promise<void>
  disconnectRealtime: () => Promise<void>
  reconnectRealtime: () => Promise<void>
}

const call = <T>(page: Page, action: string, value?: T) =>
  page.evaluate(
    ({ action, value }) => {
      const mocks = window.__KURIO_MOCKS__
      if (!mocks) throw new Error('Controles MSW não foram inicializados.')
      if (action === 'updateNft') {
        const [id, update] = value as [
          string,
          { priceEth?: string; availability?: number }
        ]
        return mocks.updateNft(id, update)
      }
      const fn = mocks[action as keyof typeof mocks] as (
        argument?: T
      ) => unknown
      return fn(value)
    },
    { action, value }
  )

export const test = base.extend<{ mock: MockControls }>({
  page: async ({ page }, fixture) => {
    await page.goto('/')
    await expect
      .poll(() => page.evaluate(() => Boolean(window.__KURIO_MOCKS__)))
      .toBe(true)
    await page.evaluate(() => window.__KURIO_MOCKS__?.reset())
    await page.reload()
    await fixture(page)
  },
  mock: async ({ page }, fixture) => {
    await fixture({
      configure: config => call(page, 'configure', config),
      failNext: failure => call(page, 'failNext', failure),
      updateNft: (id, update) => call(page, 'updateNft', [id, update]),
      emitNftUpdate: payload => call(page, 'emitNftUpdate', payload),
      emitOrderUpdate: payload => call(page, 'emitOrderUpdate', payload),
      confirmOrder: id => call(page, 'confirmOrder', id),
      disconnectRealtime: () => call(page, 'disconnectRealtime'),
      reconnectRealtime: () => call(page, 'reconnectRealtime')
    })
  }
})

export { expect }

export async function login(
  page: Page,
  email = 'demo@kurio.test',
  password = 'kurio-demo',
  path = '/login'
) {
  await page.goto(path)
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
}

export async function completeCheckout(page: Page) {
  await login(page, undefined, undefined, '/checkout')
  await page.getByLabel('Nome de exibição').fill('Demo Kurio')
  await page.getByLabel('Nome de usuário').fill('demo-kurio')
  await page.locator('#checkout-rede').selectOption('Ethereum')
  await page.getByLabel('Nome do perfil').fill('Demo Kurio')
  await page.getByLabel('Endereço da carteira').fill('0x8aC4bE7d912a0000')
  await page.getByLabel('Tipo de carteira').selectOption('MetaMask')
  await page.locator('#checkout-e-mail').fill('demo@kurio.test')
  await page.getByLabel('Nome ENS').fill('demo')
  await page.getByLabel('MetaMask', { exact: true }).check()
}
