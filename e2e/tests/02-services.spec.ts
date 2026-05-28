import { test, expect } from '@playwright/test';
import { loginAsAdmin, uniqueSuffix } from './helpers';

// ============================================================
//  Testes E2E — CRUD de Serviços (admin)
//  Fluxo completo: criar → listar → editar → excluir
// ============================================================

test.describe('CRUD de Serviços', () => {

  // Faz login como admin antes de cada teste
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('sucesso — criar novo serviço', async ({ page }) => {
    const suffix = uniqueSuffix();
    const nomeServico = `Lavagem E2E ${suffix}`;

    await page.goto('/admin/servicos');

    // Abre modal/formulário de criação
    await page.getByRole('button', { name: /novo serviço|adicionar|criar/i }).click();

    // Preenche o formulário
    await page.getByLabel(/nome/i).fill(nomeServico);
    await page.getByLabel(/descrição|descricao/i).fill('Serviço criado pelo teste E2E');
    await page.getByLabel(/preço|preco/i).fill('50');
    await page.getByLabel(/duração|duracao/i).fill('30');

    // Seleciona tipo de veículo (checkbox ou select)
    const carroCheck = page.getByLabel(/carro/i).first();
    if (await carroCheck.isVisible()) await carroCheck.check();

    await page.getByRole('button', { name: /salvar|confirmar|criar/i }).click();

    // Serviço deve aparecer na listagem
    await expect(page.getByText(nomeServico)).toBeVisible();
  });

  test('sucesso — listar serviços exibe tabela com dados', async ({ page }) => {
    await page.goto('/admin/servicos');

    // Deve haver pelo menos um serviço (seed do banco)
    await expect(page.getByText(/lavagem/i).first()).toBeVisible();
  });

  test('sucesso — editar serviço existente', async ({ page }) => {
    const suffix = uniqueSuffix();
    await page.goto('/admin/servicos');

    // Clica no botão de editar do primeiro serviço
    await page.getByRole('button', { name: /editar/i }).first().click();

    // Altera o nome
    const nomeInput = page.getByLabel(/nome/i);
    await nomeInput.clear();
    await nomeInput.fill(`Serviço Editado ${suffix}`);

    await page.getByRole('button', { name: /salvar|confirmar|atualizar/i }).click();

    // Nome atualizado deve aparecer
    await expect(page.getByText(`Serviço Editado ${suffix}`)).toBeVisible();
  });

  test('sucesso — excluir serviço', async ({ page }) => {
    const suffix = uniqueSuffix();
    const nomeServico = `Para Excluir ${suffix}`;

    await page.goto('/admin/servicos');

    // Cria um serviço para depois excluir
    await page.getByRole('button', { name: /novo serviço|adicionar|criar/i }).click();
    await page.getByLabel(/nome/i).fill(nomeServico);
    await page.getByLabel(/descrição|descricao/i).fill('Será excluído');
    await page.getByLabel(/preço|preco/i).fill('10');
    await page.getByLabel(/duração|duracao/i).fill('15');
    const carroCheck = page.getByLabel(/carro/i).first();
    if (await carroCheck.isVisible()) await carroCheck.check();
    await page.getByRole('button', { name: /salvar|confirmar|criar/i }).click();

    // Confirma que foi criado
    await expect(page.getByText(nomeServico)).toBeVisible();

    // Localiza a linha do serviço e clica em excluir
    const linha = page.getByText(nomeServico).locator('..').locator('..');
    await linha.getByRole('button', { name: /excluir|deletar|remover/i }).click();

    // Confirma exclusão no modal de confirmação (se houver)
    const confirmar = page.getByRole('button', { name: /confirmar|sim|excluir/i });
    if (await confirmar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmar.click();
    }

    // Serviço não deve mais aparecer
    await expect(page.getByText(nomeServico)).not.toBeVisible();
  });

  test('falha — criar serviço sem nome exibe erro', async ({ page }) => {
    await page.goto('/admin/servicos');
    await page.getByRole('button', { name: /novo serviço|adicionar|criar/i }).click();

    // Não preenche o nome
    await page.getByLabel(/preço|preco/i).fill('50');
    await page.getByLabel(/duração|duracao/i).fill('30');
    await page.getByRole('button', { name: /salvar|confirmar|criar/i }).click();

    // Deve exibir erro de validação
    await expect(
      page.getByText(/nome.*obrigatório|campo.*obrigatório|preencha/i).first()
    ).toBeVisible();
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

    await expect(
      page.getByText(/preço.*maior|preço.*zero|inválid/i).first()
    ).toBeVisible();
  });

});
