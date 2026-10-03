import { expect, test } from './support/fixtures'

test('salva o favorito solicitado antes da autenticação', async ({ page }) => {
  await page.goto('/nft/cosmic-bloom-118')

  await page.getByRole('button', { name: 'Favoritar' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('kurio-demo')
  await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()

  const favoriteButton = page.getByRole('button', { name: 'Favoritar' })
  await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')

  await page.reload()
  await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
})

test('exibe favoritos isolados na rota privada', async ({ page }) => {
  await page.goto('/nft/cosmic-bloom-118')
  await page.getByRole('button', { name: 'Favoritar' }).click()
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('kurio-demo')
  await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
  await page.goto('/favorites')
  await expect(page.getByRole('heading', { name: 'Favoritos' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Cosmic Bloom/ })).toBeVisible()
})
