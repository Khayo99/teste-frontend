import { expect, test } from './support/fixtures'

test('abre o catálogo ao navegar para Mercado fora da página inicial', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/cart')

  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Mercado' }).click()

  await expect(page).toHaveURL(/\/#mercado$/)
  await expect(page.locator('#mercado')).toBeInViewport()
})
