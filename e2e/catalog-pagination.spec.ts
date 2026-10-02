import { expect, test } from '@playwright/test'

test('changes the catalog NFT page', async ({ page }) => {
  await page.goto('/')
  const catalog = page.locator('#mercado')
  await catalog.scrollIntoViewIfNeeded()

  await expect(catalog.getByText('Emerald Ape #042')).toBeVisible()
  await expect(catalog.getByRole('button', { name: /Página/ })).toHaveCount(4)
  await catalog.getByRole('button', { name: 'Página 2' }).click()
  await expect(catalog.getByText('Arte digital #003')).toBeVisible()
  await expect(catalog.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
})
