import { Page } from '@playwright/test';

// ============================================================
//  Helpers compartilhados para os testes E2E
// ============================================================

export const ADMIN_EMAIL    = process.env.E2E_ADMIN_EMAIL    || 'admin@aquawash.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123';

/** Gera dados únicos para evitar conflitos entre execuções */
export function uniqueSuffix(): string {
  return Date.now().toString().slice(-6);
}

/** Faz login via UI e aguarda redirecionamento */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();
}

/** Faz login como admin e aguarda dashboard admin */
export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.waitForURL('**/admin**');
}

/** Faz logout */
export async function logout(page: Page): Promise<void> {
  // Tenta botão de logout no menu
  const logoutBtn = page.getByRole('button', { name: /sair/i });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  } else {
    await page.goto('/login');
  }
}
