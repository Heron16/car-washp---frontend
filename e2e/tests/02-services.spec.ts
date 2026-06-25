import { test, expect } from '@playwright/test';
import { loginAsAdmin, uniqueSuffix } from './helpers';

test.describe('CRUD de Serviços', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('sucesso — criar novo serviço', async ({ page }) => {
    const suffix = uniqueSuffix();
    const nomeServico = `Lavagem E2E ${suffix}`;

    await page.goto('/admin/servicos');
    await page.getByRole('button', { name: /novo serviço|adicionar|criar/i }).click();
    await page.getByLabel(/nome/i).fill(nomeServico);
    await page.getByLabel(/descrição|descricao/i).fill('Serviço criado pelo teste E2E');
    await page.getByLabel(/preço|preco/i).fill('50');
    await page.getByLabel(/duração|duracao/i).fill('30');
    const carroCheck = page.getByLabel(/carro/i).first();
    if (await carroCheck.isVisible()) await carroCheck.check();
    await page.getByRole('button', { name: /salvar|confirmar|criar/i }).click();
    await expect(page.getByText(nomeServico)).toBeVisible();
  });

  test('sucesso — listar serviços exibe tabela com dados', async ({ page }) => {
    await page.goto('/admin/servicos');
    await expect(page.getByText(/lavagem/i).first()).toBeVisible();
  });

  test('sucesso — editar serviço existente', async ({ page }) => {
    const suffix = uniqueSuffix();
    const nomeOriginal = `Para Editar ${suffix}`;
    const nomeEditado = `Serviço Editado ${suffix}`;

    await page.goto('/admin/servicos');

    // Cria um serviço temporário para editar
    await page.getByRole('button', { name: /novo serviço|adicionar|criar/i }).click();
    await page.getByLabel(/nome/i).fill(nomeOriginal);
    await page.getByLabel(/descrição|descricao/i).fill('Será editado');
    await page.getByLabel(/preço|preco/i).fill('40');
    await page.getByLabel(/duração|duracao/i).fill('25');
    const carroCheck = page.getByLabel(/carro/i).first();
    if (await carroCheck.isVisible()) await carroCheck.check();
    await page.getByRole('button', { name: /salvar|confirmar|criar/i }).click();
    await expect(page.getByText(nomeOriginal)).toBeVisible();

    // Edita o serviço criado
    const linha = page.getByText(nomeOriginal).locator('..').locator('..');
    await linha.getByRole('button', { name: /editar/i }).click();
    const nomeInput = page.getByLabel(/nome/i);
    await nomeInput.clear();
    await nomeInput.fill(nomeEditado);
    await page.getByRole('button', { name: /salvar|confirmar|atualizar/i }).click();
    await expect(page.getByText(nomeEditado)).toBeVisible();

    // Limpa — exclui o serviço editado
    const linhaEditada = page.getByText(nomeEditado).locator('..').locator('..');
    await linhaEditada.getByRole('button', { name: /excluir|deletar|remover/i }).click();
    const confirmar = page.getByRole('button', { name: /confirmar|sim|excluir/i });
    if (await confirmar.isVisible({ timeout: 2000 }).catch(() => false)) await confirmar.click();
  });

  test('sucesso — excluir serviço', async ({ page }) => {
    const suffix = uniqueSuffix();
    const nomeServico = `Para Excluir ${suffix}`;

    await page.goto('/admin/servicos');
    await page.getByRole('button', { name: /novo serviço|adicionar|criar/i }).click();
    await page.getByLabel(/nome/i).fill(nomeServico);
    await page.getByLabel(/descrição|descricao/i).fill('Será excluído');
    await page.getByLabel(/preço|preco/i).fill('10');
    await page.getByLabel(/duração|duracao/i).fill('15');
    const carroCheck = page.getByLabel(/carro/i).first();
    if (await carroCheck.isVisible()) await carroCheck.check();
    await page.getByRole('button', { name: /salvar|confirmar|criar/i }).click();
    await expect(page.getByText(nomeServico)).toBeVisible();

    const linha = page.getByText(nomeServico).locator('..').locator('..');
    await linha.getByRole('button', { name: /excluir|deletar|remover/i }).click();
    const confirmar = page.getByRole('button', { name: /confirmar|sim|excluir/i });
    if (await confirmar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmar.click();
    }
    await expect(page.getByText(nomeServico)).not.toBeVisible();
  });

  test('falha — criar serviço sem nome exibe erro', async ({ page }) => {
    await page.goto('/admin/servicos');
    await page.getByRole('button', { name: /novo serviço|adicionar|criar/i }).click();
    await page.getByLabel(/preço|preco/i).fill('50');
    await page.getByLabel(/duração|duracao/i).fill('30');
    await page.getByRole('button', { name: /salvar|confirmar|criar/i }).click();
    await expect(page.getByText(/nome.*obrigatório|campo.*obrigatório|preencha/i).first()).toBeVisible();
  });

  test('falha — criar serviço com preço zero exibe erro', async ({ page }) => {
    const suffix = uniqueSuffix();
    await page.goto('/admin/servicos');
    await page.getByRole('button', { name: /novo serviço|adicionar|criar/i }).click();
    await page.getByLabel(/nome/i).fill(`Serviço Inválido ${suffix}`);
    await page.getByLabel(/descrição|descricao/i).fill('Teste');
    await page.getByLabel(/preço|preco/i).fill('0');
    await page.getByLabel(/duração|duracao/i).fill('30');
    await page.getByRole('button', { name: /salvar|confirmar|criar/i }).click();
    await expect(page.getByText(/preço.*maior|preço.*zero|inválid/i).first()).toBeVisible();
  });

});
