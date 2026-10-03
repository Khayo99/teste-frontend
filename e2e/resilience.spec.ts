import { completeCheckout, expect, login, test } from './support/fixtures'

test.describe('falhas, tempo real e recuperação', () => {
  test('faz rollback de favorito após falha de mutation', async ({
    page,
    mock
  }) => {
    await login(page)
    await page.goto('/nft/cosmic-bloom-118')
    await mock.failNext({
      path: '/api/favorites/cosmic-bloom-118',
      status: 503
    })
    const favorite = page.getByRole('button', { name: 'Favoritar' })
    await favorite.click()
    await expect(page.getByRole('status')).toContainText(
      'Não foi possível atualizar o favorito'
    )
    await expect(favorite).toHaveAttribute('aria-pressed', 'false')
    await favorite.click()
    await expect(favorite).toHaveAttribute('aria-pressed', 'true')
  })

  test('mostra skeleton, falha REST e recupera por nova tentativa', async ({
    page,
    mock
  }) => {
    await mock.configure({ latencyMs: 700 })
    await page.goto('/nft/emerald-ape-042')
    await expect(page.getByLabel('Carregando NFT')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Emerald Ape #042' })
    ).toBeVisible()
    await mock.failNext({ path: '/api/nfts/emerald-ape-042', status: 503 })
    await page.reload()
    await expect(
      page.getByText('Não foi possível carregar este NFT.')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(
      page.getByRole('heading', { name: 'Emerald Ape #042' })
    ).toBeVisible()
  })

  test('invalida revisão ao receber atualização de preço pelo Socket.IO', async ({
    page,
    mock
  }) => {
    await completeCheckout(page)
    await mock.updateNft('emerald-ape-042', { priceEth: '9.99' })
    await expect(page.getByRole('status')).toContainText(
      'cotação foi atualizada'
    )
    await expect(
      page.getByRole('button', { name: 'Confirmar compra' })
    ).toBeDisabled()
    await page.getByRole('button', { name: 'Revisar cotação' }).click()
    await expect(
      page.getByRole('button', { name: 'Confirmar compra' })
    ).toBeEnabled()
  })

  test('recupera timeout com o mesmo pedido e não duplica confirmação', async ({
    page,
    mock
  }) => {
    await mock.configure({ scenario: 'order-timeout' })
    await completeCheckout(page)
    await page.getByRole('button', { name: 'Confirmar compra' }).dblclick()
    await expect(
      page.getByRole('heading', { name: 'Pedido pendente' })
    ).toBeVisible()
    const orderId = await page
      .locator('.checkout-result-identifiers dd')
      .first()
      .textContent()
    expect(orderId).toBeTruthy()
    await mock.confirmOrder(orderId!)
    await expect(
      page.getByRole('heading', { name: 'Pedido confirmado' })
    ).toBeVisible()
  })

  test('ignora evento duplicado ou antigo e reconecta o cliente Socket.IO', async ({
    page,
    mock
  }) => {
    await login(page)
    await page.goto('/orders')
    await mock.disconnectRealtime()
    await mock.reconnectRealtime()
    await mock.emitOrderUpdate({
      orderId: 'ord-inexistente',
      userId: 'user-demo',
      status: 'pending',
      version: 4
    })
    await mock.emitOrderUpdate({
      orderId: 'ord-inexistente',
      userId: 'user-demo',
      status: 'declined',
      version: 3
    })
    await expect(page.getByText('Você ainda não tem pedidos.')).toBeVisible()
  })
})
