import { expect, test } from '@playwright/test'


test('faz login e mantém a sessão após refresh', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha').fill('kurio-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/')
  await page.reload()
  await expect(page.getByRole('button', { name: /Sair/ })).toBeAttached()
})

test('protege checkout e retorna ao destino após autenticar', async ({ page }) => {
  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcheckout/)
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('kurio-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/checkout')
})

test('exibe erro genérico para credenciais inválidas', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill('someone@example.com')
  await page.getByLabel('Senha').fill('wrong-password')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha inválidos.')
})

test('cadastra conta e valida e-mail duplicado', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Nome').fill('Nova Pessoa')
  await page.getByLabel('E-mail', { exact: true }).fill('demo@kurio.test')
  await page.getByLabel('Senha', { exact: true }).fill('kurio-demo')
  await page.getByLabel('Confirmar senha').fill('kurio-demo')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.getByText('Este e-mail já está cadastrado.')).toBeVisible()
})

test('cria e persiste um novo usuário após refresh', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Criar conta' }).click()
  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeAttached()
  await page.getByLabel('Nome').fill('Pessoa Persistida')
  await page.getByLabel('E-mail', { exact: true }).fill('persistida@example.com')
  await page.getByLabel('Senha', { exact: true }).fill('senha-segura-123')
  await page.getByLabel('Confirmar senha').fill('senha-segura-123')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('button', { name: /Sair/ })).toBeAttached()
  await page.reload()
  await expect(page.getByRole('button', { name: /Sair/ })).toBeAttached()
})
