import { expect, login, test } from './support/fixtures'

async function stable(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'
  })
}

test.describe('regressão visual', () => {
  test('início', async ({ page }) => {
    await stable(page)
    await page.goto('/')
    await expect(page.locator('#mercado')).toBeVisible()
    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })

  test('detalhe', async ({ page }) => {
    await stable(page)
    await page.goto('/nft/emerald-ape-042')
    await expect(
      page.getByRole('heading', { name: 'Emerald Ape #042' })
    ).toBeVisible()
    await expect(page).toHaveScreenshot('detail.png', { fullPage: true })
  })

  test('carrinho', async ({ page }) => {
    await stable(page)
    await page.goto('/cart')
    await expect(
      page
        .getByText('Resumo da carteira')
        .or(page.getByText('Resumo do pagamento'))
    ).toBeVisible()
    await expect(page).toHaveScreenshot('cart.png', { fullPage: true })
  })

  test('pagamento', async ({ page }) => {
    await stable(page)
    await login(page)
    await page.goto('/checkout')
    await expect(
      page.getByRole('heading', { name: 'Perfil do colecionador' })
    ).toBeVisible()
    await expect(page).toHaveScreenshot('checkout.png', { fullPage: true })
  })
})
