import { expect, test } from '@playwright/test'

test('exibe a composição mobile do detalhe do NFT e ajusta a quantidade', async ({ page }) => {
  await page.goto('/nft/emerald-ape-042')

  await expect(page.getByRole('button', { name: 'Voltar' })).toBeVisible()
  await expect(page.getByAltText('Imagem principal de Emerald Ape #042').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Comprar NFT' })).toBeVisible()

  const quantity = page.getByRole('group', { name: 'Quantidade' })
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await expect(quantity).toContainText('2')
})
