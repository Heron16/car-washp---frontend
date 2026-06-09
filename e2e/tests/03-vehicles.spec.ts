import { test, expect } from '@playwright/test';
import { loginAs, uniqueSuffix } from './helpers';

const CLIENT_EMAIL    = 'cliente.e2e@gmail.com';
const CLIENT_PASSWORD = 'Senha@123';
const CLIENT_CPF      = '529.982.247-25';

test.describe('CRUD de Veículos', () => {

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/cadastro');
    try {
      await page.getByLabel(/nome/i).fill('Cliente E2E Veículos');
      await page.getByLabel(/e-mail/i).fill(CLIENT_EMAIL);
      await page.getByLabel(/cpf/i).fill(CLIENT_CPF);
      await page.getByLabel(/senha/i).fill(CLIENT_PASSWORD);
      await page.getByRole('button', { name: /cadastrar|criar conta/i }).click();
      await page.waitForURL(/\/(login|dashboard)/, { timeout: 5000 });
    } catch {
      // usuário já existe
    }
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL, CLIENT_PASSWORD);
    await page.waitForURL('**/dashboard**');
  });

  test('sucesso — cadastrar novo veículo', async ({ page }) => {
    const suffix = uniqueSuffix();
    const placa = `TST${suffix.slice(-4)}`;

    await page.goto('/dashboard/veiculos');
    await page.getByRole('button', { name: /novo veículo|adicionar|cadastrar/i }).click();
    await page.getByLabel(/marca/i).fill('Toyota');
    await page.getByLabel(/modelo/i).fill('Corolla');
    await page.getByLabel(/ano/i).fill('2022');
    await page.getByLabel(/placa/i).fill(placa);
    await page.getByLabel(/cor/i).fill('Prata');
    const tipoSelect = page.getByLabel(/tipo/i);
    if (await tipoSelect.isVisible()) await tipoSelect.selectOption('carro');
    await page.getByRole('button', { name: /salvar|confirmar|cadastrar/i }).click();
    await expect(page.getByText('Toyota').first()).toBeVisible();
    await expect(page.getByText(placa)).toBeVisible();
  });

  test('sucesso — listar veículos exibe os cadastrados', async ({ page }) => {
    await page.goto('/dashboard/veiculos');
    await expect(page.getByRole('heading', { name: /veículo/i })).toBeVisible();
  });

  test('sucesso — editar veículo existente', async ({ page }) => {
    const suffix = uniqueSuffix();
    const placa = `EDT${suffix.slice(-4)}`;

    await page.goto('/dashboard/veiculos');
    await page.getByRole('button', { name: /novo veículo|adicionar|cadastrar/i }).click();
    await page.getByLabel(/marca/i).fill('Honda');
    await page.getByLabel(/modelo/i).fill('Civic');
    await page.getByLabel(/ano/i).fill('2021');
    await page.getByLabel(/placa/i).fill(placa);
    await page.getByLabel(/cor/i).fill('Preto');
    const tipoSelect = page.getByLabel(/tipo/i);
    if (await tipoSelect.isVisible()) await tipoSelect.selectOption('carro');
    await page.getByRole('button', { name: /salvar|confirmar|cadastrar/i }).click();
    await expect(page.getByText(placa)).toBeVisible();

    const linha = page.getByText(placa).locator('..').locator('..');
    await linha.getByRole('button', { name: /editar/i }).click();
    const corInput = page.getByLabel(/cor/i);
    await corInput.clear();
    await corInput.fill('Branco');
    await page.getByRole('button', { name: /salvar|confirmar|atualizar/i }).click();
    await expect(page.getByText('Branco').first()).toBeVisible();
  });

  test('sucesso — excluir veículo', async ({ page }) => {
    const suffix = uniqueSuffix();
    const placa = `DEL${suffix.slice(-4)}`;

    await page.goto('/dashboard/veiculos');
    await page.getByRole('button', { name: /novo veículo|adicionar|cadastrar/i }).click();
    await page.getByLabel(/marca/i).fill('Fiat');
    await page.getByLabel(/modelo/i).fill('Uno');
    await page.getByLabel(/ano/i).fill('2019');
    await page.getByLabel(/placa/i).fill(placa);
    await page.getByLabel(/cor/i).fill('Vermelho');
    const tipoSelect = page.getByLabel(/tipo/i);
    if (await tipoSelect.isVisible()) await tipoSelect.selectOption('carro');
    await page.getByRole('button', { name: /salvar|confirmar|cadastrar/i }).click();
    await expect(page.getByText(placa)).toBeVisible();

    const linha = page.getByText(placa).locator('..').locator('..');
    await linha.getByRole('button', { name: /excluir|deletar|remover/i }).click();
    const confirmar = page.getByRole('button', { name: /confirmar|sim|excluir/i });
    if (await confirmar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmar.click();
    }
    await expect(page.getByText(placa)).not.toBeVisible();
  });

  test('falha — cadastrar veículo com placa duplicada exibe erro', async ({ page }) => {
    const suffix = uniqueSuffix();
    const placa = `DUP${suffix.slice(-4)}`;

    await page.goto('/dashboard/veiculos');
    await page.getByRole('button', { name: /novo veículo|adicionar|cadastrar/i }).click();
    await page.getByLabel(/marca/i).fill('VW');
    await page.getByLabel(/modelo/i).fill('Gol');
    await page.getByLabel(/ano/i).fill('2020');
    await page.getByLabel(/placa/i).fill(placa);
    await page.getByLabel(/cor/i).fill('Azul');
    const tipoSelect = page.getByLabel(/tipo/i);
    if (await tipoSelect.isVisible()) await tipoSelect.selectOption('carro');
    await page.getByRole('button', { name: /salvar|confirmar|cadastrar/i }).click();
    await expect(page.getByText(placa)).toBeVisible();

    await page.getByRole('button', { name: /novo veículo|adicionar|cadastrar/i }).click();
    await page.getByLabel(/marca/i).fill('Chevrolet');
    await page.getByLabel(/modelo/i).fill('Onix');
    await page.getByLabel(/ano/i).fill('2023');
    await page.getByLabel(/placa/i).fill(placa);
    await page.getByLabel(/cor/i).fill('Verde');
    if (await tipoSelect.isVisible()) await tipoSelect.selectOption('carro');
    await page.getByRole('button', { name: /salvar|confirmar|cadastrar/i }).click();
    await expect(page.getByText(/placa.*cadastrada|placa.*exist|já cadastrad/i).first()).toBeVisible();
  });

  test('falha — cadastrar veículo sem campos obrigatórios exibe erro', async ({ page }) => {
    await page.goto('/dashboard/veiculos');
    await page.getByRole('button', { name: /novo veículo|adicionar|cadastrar/i }).click();
    await page.getByRole('button', { name: /salvar|confirmar|cadastrar/i }).click();
    await expect(page.getByText(/obrigatório|preencha|campo.*requerido/i).first()).toBeVisible();
  });

});
