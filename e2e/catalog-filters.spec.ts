import { expect, test } from './support/fixtures'

test('collection filters expose fixture counts and update the listing', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const catalog = page.locator('#mercado')
  await catalog.scrollIntoViewIfNeeded()

  await expect(
    catalog.getByRole('button', { name: 'Arte digital' })
  ).toContainText('(33)')
  await expect(catalog.getByRole('button', { name: 'Música' })).toContainText(
    '(65)'
  )

  await catalog.getByRole('button', { name: 'Arte digital' }).click()
  await expect(catalog.getByText('Emerald Ape #042')).toBeVisible()
  await expect(catalog.getByText('Cosmic Bloom #118')).toBeVisible()
  await expect(catalog.getByText('Sage Nomad #009')).not.toBeVisible()
  await expect(catalog.getByRole('button', { name: 'Música' })).toContainText(
    '(65)'
  )
})
