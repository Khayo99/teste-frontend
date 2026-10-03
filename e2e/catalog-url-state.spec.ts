import { expect, test } from './support/fixtures'

test('restores catalog filters and page from the URL', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/?page=2&sort=price-desc')
  const catalog = page.locator('#mercado')
  await catalog.scrollIntoViewIfNeeded()

  await expect(
    catalog.getByRole('button', { name: 'Página 2' })
  ).toHaveAttribute('aria-current', 'page')
  await expect(catalog.locator('#catalog-sort')).toHaveValue('price-desc')

  await catalog.getByRole('button', { name: 'Arte digital' }).click()
  await expect(page).toHaveURL(/category=Arte(?:%20|\+)digital/)
  await expect(page).toHaveURL(/page=1/)
  await expect(
    catalog.getByRole('button', { name: 'Página 1' })
  ).toHaveAttribute('aria-current', 'page')

  await page.reload()
  await expect(
    catalog.getByRole('button', { name: 'Arte digital' })
  ).toHaveClass(/text-text-accent/)
  await expect(catalog.locator('#catalog-sort')).toHaveValue('price-desc')
})

test('searches the catalog through the URL', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await page.getByRole('textbox', { name: 'Buscar NFTs' }).fill('Emerald Ape')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()

  await expect(page).toHaveURL(/search=Emerald(?:%20|\+)Ape/)
  await expect(
    page.locator('#mercado').getByText('Emerald Ape #042')
  ).toBeVisible()
})

test('searches the catalog from the mobile explore collections control', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await page.getByRole('button', { name: 'Explorar coleções' }).click()
  await page.getByRole('textbox', { name: 'Buscar NFTs' }).fill('Emerald Ape')
  await page.getByRole('button', { name: 'Pesquisar' }).click()

  await expect(page).toHaveURL(/search=Emerald(?:%20|\+)Ape/)
  await expect(
    page.locator('#mercado').getByText('Emerald Ape #042')
  ).toBeVisible()
})
