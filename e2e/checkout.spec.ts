import { expect, test } from './support/fixtures'

async function signInAtCheckout(page: import('@playwright/test').Page) {
  await page.goto('/checkout')
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('kurio-demo')
  await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/checkout')
}

test('exibe o modal de confirmação após concluir a compra', async ({
  page
}) => {
  await signInAtCheckout(page)
  await expect(
    page.getByRole('heading', { name: 'Perfil do colecionador' })
  ).toBeVisible()
  await page.locator('#checkout-nome-de-exibição').fill('Demo Kurio')
  await page.locator('#checkout-nome-de-usuário').fill('demo-kurio')
  await page.locator('#checkout-rede').selectOption('Ethereum')
  await page.locator('#checkout-nome-do-perfil').fill('Demo Kurio')
  await page
    .locator('#checkout-endereço-da-carteira')
    .fill('0x8aC4bE7d912a0000')
  await page.locator('#checkout-tipo-de-carteira').selectOption('MetaMask')
  await page.locator('#checkout-e-mail').fill('demo@kurio.test')
  await page.locator('#checkout-nome-ens').fill('demo')
  await page.getByLabel('MetaMask', { exact: true }).check()
  await page.getByRole('button', { name: 'Revisar cotação' }).click()
  const confirm = page.getByRole('button', { name: 'Confirmar compra' })
  await expect(confirm).toBeEnabled()
  await confirm.click()
  const confirmation = page.getByRole('dialog', {
    name: 'Seus NFTs agora estão na sua carteira'
  })
  await expect(confirmation).toBeVisible()
  await expect(
    confirmation.getByRole('heading', { name: 'Detalhes da transação' })
  ).toBeVisible()
  await expect(
    confirmation.getByRole('button', { name: 'Ver no Etherscan' })
  ).toBeVisible()
})

test('mantém confirmação bloqueada sem itens no carrinho', async ({ page }) => {
  await signInAtCheckout(page)
  await expect(
    page.getByRole('button', { name: 'Confirmar compra' })
  ).toBeDisabled()
})
