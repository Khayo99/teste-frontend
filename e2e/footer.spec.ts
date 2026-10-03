import { expect, test } from './support/fixtures'

test.describe('marketplace footer', () => {
  test('validates newsletter input and confirms a valid subscription', async ({
    page
  }) => {
    await page.goto('/')

    const footer = page.getByRole('contentinfo')
    await footer.scrollIntoViewIfNeeded()

    await footer.getByRole('button', { name: 'Enviar' }).click()
    await expect(footer.getByRole('alert')).toContainText(
      'Informe um e-mail válido'
    )

    await footer
      .getByLabel('E-mail para novidades')
      .fill('colecionador@example.com')
    await footer.getByRole('button', { name: 'Enviar' }).click()
    await expect(footer.getByRole('status')).toContainText(
      'Inscrição confirmada'
    )
  })

  test('keeps footer content visible without horizontal overflow', async ({
    page
  }) => {
    await page.goto('/')
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded()

    await expect(
      page.getByRole('heading', { name: 'Segurança da carteira' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Meu perfil' })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Instagram' })).toBeVisible()

    const dimensions = await page.locator('body').evaluate(element => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(
      dimensions.clientWidth + 1
    )
  })

  test('reflows at tablet and wide desktop widths', async ({ page }) => {
    for (const width of [768, 1440]) {
      await page.setViewportSize({ height: 1000, width })
      await page.goto('/')
      await page.getByRole('contentinfo').scrollIntoViewIfNeeded()

      await expect(
        page.getByRole('heading', { name: 'Antecipe-se ao próximo lançamento' })
      ).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'Carteiras compatíveis' })
      ).toBeVisible()

      const dimensions = await page.locator('body').evaluate(element => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth
      }))
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(
        dimensions.clientWidth + 1
      )
    }
  })

  test('preserves keyboard access through newsletter controls', async ({
    page
  }) => {
    await page.goto('/')
    const footer = page.getByRole('contentinfo')
    await footer.scrollIntoViewIfNeeded()

    const email = footer.getByLabel('E-mail para novidades')
    const submit = footer.getByRole('button', { name: 'Enviar' })
    await email.focus()
    await expect(email).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(submit).toBeFocused()
  })
})
