import { expect, test } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('kurio-demo')
  await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
}

test('botão Entrar autenticado abre perfil e perfil é persistido', async ({ page }) => {
  await login(page)
  await page.getByRole('banner').getByRole('button', { name: 'Demo Kurio' }).click()
  await expect(page).toHaveURL('/profile')
  await page.getByLabel('Nome de exibição').fill('Colecionador Kurio')
  await page.getByLabel('Apelido da carteira').fill('Minha carteira')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Perfil salvo com sucesso.')
  await page.reload()
  await expect(page.getByLabel('Nome de exibição')).toHaveValue('Colecionador Kurio')
})

test('um único salvar atualiza avatar e senha', async ({ page }) => {
  await login(page)
  await page.goto('/profile')
  await page.getByLabel('Apelido da carteira').fill('Minha carteira')
  await page.getByLabel('Selecionar avatar').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('89504e470d0a1a0a', 'hex') })
  await page.getByLabel('Senha atual').fill('kurio-demo')
  await page.getByLabel('Nova senha', { exact: true }).fill('nova-senha-123')
  await page.getByLabel('Confirmar nova senha').fill('nova-senha-123')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Perfil salvo com sucesso.')
  await expect(page.getByAltText('Pré-visualização do avatar')).toBeVisible()
})

test('valida e salva carteira principal', async ({ page }) => {
  await login(page)
  await page.goto('/wallets')
  await page.getByLabel('Nome de exibição').fill('Principal')
  await page.getByLabel('Apelido da carteira').fill('Kurio principal')
  await page.getByLabel('Rede', { exact: true }).selectOption('Ethereum')
  await page.getByLabel('Nome do perfil').fill('Kurio')
  await page.getByLabel('Endereço da carteira').fill('0x1234567890abcdef')
  await page.getByLabel('Tipo de carteira').selectOption('MetaMask')
  await page.getByLabel('Código de indicação').fill('KURIO')
  await page.getByLabel('E-mail').fill('demo@kurio.test')
  await page.getByLabel('Nome ENS').fill('demo')
  await page.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByRole('status')).toHaveText('Carteira salva com sucesso.')
})

test('sair encerra a sessão imediatamente', async ({ page }) => {
  await login(page)
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('banner').getByRole('button', { name: 'Entrar' })).toBeVisible()
})
