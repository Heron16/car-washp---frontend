import { Page } from '@playwright/test';

export const ADMIN_EMAIL    = process.env.E2E_ADMIN_EMAIL    || 'admin@aquawash.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123';

export function uniqueSuffix(): string {
  return Date.now().toString().slice(-6);
}

export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.waitForURL('**/admin**');
}

export async function logout(page: Page): Promise<void> {
  const logoutBtn = page.getByRole('button', { name: /sair/i });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  } else {
    await page.goto('/login');
  }
}
