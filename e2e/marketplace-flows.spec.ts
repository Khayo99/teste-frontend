import { completeCheckout, expect, login, test } from './support/fixtures'

test.describe('jornadas críticas do marketplace', () => {
  test('combina busca, filtros, ordenação, paginação e histórico', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(
      '/?search=Ape&category=Arte%20digital&network=Ethereum&minPrice=0.02&maxPrice=12.3&sort=price-desc'
    )
    const catalog = page.locator('#mercado')
    await catalog.scrollIntoViewIfNeeded()
    await expect(catalog.locator('#catalog-sort')).toHaveValue('price-desc')
    await expect(catalog.getByText('Emerald Ape #042')).toBeVisible()
    await catalog.getByRole('button', { name: 'Página 2' }).click()
    await expect(page).toHaveURL(/page=2/)
    await page.goBack()
    await expect(page).toHaveURL(/page=1/)
    await expect(
      catalog.getByRole('button', { name: 'Página 1' })
    ).toHaveAttribute('aria-current', 'page')
    await page.reload()
    await expect(catalog.locator('#catalog-sort')).toHaveValue('price-desc')
  })

  test('abre detalhe diretamente e informa NFT inexistente', async ({
    page
  }) => {
    await page.goto('/nft/emerald-ape-042')
    await expect(
      page.getByRole('heading', { name: 'Emerald Ape #042' })
    ).toBeVisible()
    await page.goto('/nft/nao-existe')
    await expect(page.getByText('NFT não encontrado')).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Voltar ao catálogo' })
    ).toBeVisible()
  })

  test('mantém carrinho, quantidades, cupom e itens após refresh e login', async ({
    page
  }) => {
    await page.goto('/cart')
    const cart = page.getByRole('main')
    const increase = page.getByRole('button', {
      name: /Aumentar quantidade de Emerald Ape/
    })
    await expect(increase).toBeDisabled()
    await page
      .getByRole('button', { name: /Diminuir quantidade de Emerald Ape/ })
      .click()
    await expect(
      cart.getByRole('group', { name: /Quantidade de Emerald Ape/ })
    ).toContainText('1')
    await page.getByLabel(/Código promocional/).fill('KURIO10')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByRole('status')).toContainText(
      'Cupom KURIO10 aplicado'
    )
    await page.reload()
    await expect(page.getByText('KURIO10 aplicado')).toBeVisible()
    await login(page)
    await page.goto('/cart')
    await expect(page.getByText('KURIO10 aplicado')).toBeVisible()
    await page.getByRole('button', { name: /Remover Ivory Baron/ }).click()
    await expect(page.getByText('Ivory Baron #088')).not.toBeVisible()
  })

  test('conclui uma compra e mostra recibo confirmado', async ({ page }) => {
    await completeCheckout(page)
    const confirm = page.getByRole('button', { name: 'Confirmar compra' })
    await expect(confirm).toBeEnabled()
    await confirm.click()
    await expect(
      page.getByRole('dialog', {
        name: 'Seus NFTs agora estão na sua carteira'
      })
    ).toBeVisible()
    await expect(
      page.getByRole('dialog').getByText('Detalhes da transação')
    ).toBeVisible()
  })
})
