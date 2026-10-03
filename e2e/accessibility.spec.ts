import { expect, login, test } from './support/fixtures'

test.describe('acessibilidade de fluxos críticos', () => {
  test('mantém foco no diálogo de autenticação e permite fechar com Escape', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/')
    const trigger = page
      .getByRole('banner')
      .getByRole('button', { name: 'Entrar' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('E-mail', { exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
  })

  test('expõe erro de validação e mantém campos acessíveis no perfil', async ({
    page
  }) => {
    await login(page)
    await page.goto('/profile')
    await page.getByLabel('Nome de exibição').fill('')
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText(
      'Informe seu nome de exibição'
    )
    await expect(page.getByLabel('Nome de exibição')).toBeVisible()
  })
})
