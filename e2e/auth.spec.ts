import { expect, test } from './support/fixtures'

test('faz login e mantém a sessão após refresh', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha').fill('kurio-demo')
  await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/')
  await page.reload()
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Demo Kurio' })
  ).toBeAttached()
})

test('protege checkout e retorna ao destino após autenticar', async ({
  page
}) => {
  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcheckout/)
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('kurio-demo')
  await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/checkout')
})

test('exibe erro genérico para credenciais inválidas', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('someone@example.com')
  await page.getByLabel('Senha').fill('wrong-password')
  await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos.')
})

test('cadastra conta e valida e-mail duplicado', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Nome').fill('Nova Pessoa')
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('kurio-demo')
  await page.getByLabel('Confirmar senha').fill('kurio-demo')
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Criar conta' })
    .click()
  await expect(page.getByText('Este e-mail já está cadastrado.')).toBeVisible()
})

test('cria e persiste um novo usuário após refresh', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Criar conta' }).click()
  await expect(
    page.getByRole('heading', { name: 'Criar conta' })
  ).toBeAttached()
  await page.getByLabel('Nome').fill('Pessoa Persistida')
  await page
    .getByLabel('E-mail', { exact: true })
    .fill('persistida@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('senha-segura-123')
  await page.getByLabel('Confirmar senha').fill('senha-segura-123')
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Criar conta' })
    .click()
  await expect(page).toHaveURL('/')
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Pessoa Persistida' })
  ).toBeAttached()
  await page.reload()
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Pessoa Persistida' })
  ).toBeAttached()
})

test('abre o login sobre a tela atual sem remover o conteúdo', async ({
  page
}) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) < 768,
    'O botão Entrar fica recolhido no menu mobile.'
  )
  await page.goto('/')
  await page.getByRole('banner').getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: /SEJA DONO DO FUTURO/ })
  ).toBeVisible()
  await expect(page.locator('#mercado')).toBeVisible()
})
