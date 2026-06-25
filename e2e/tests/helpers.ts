import { Page } from '@playwright/test';

export const ADMIN_EMAIL    = process.env.E2E_ADMIN_EMAIL    || 'admin@aquawash.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123';

export function uniqueSuffix(): string {
  return Date.now().toString().slice(-6);
}

// Lista de CPFs válidos para rotação nos testes
const VALID_CPFS = [
  '349.749.030-04',
  '594.267.810-30',
  '271.875.462-11',
  '141.477.793-01',
  '460.396.177-48',
  '319.034.725-55',
  '472.554.666-64',
  '597.974.213-17',
  '728.705.577-52',
  '664.414.951-04',
  '996.337.553-79',
  '323.753.104-97',
  '996.592.403-17',
  '494.237.771-47',
  '559.794.478-90',
];

let cpfIndex = 0;
export function uniqueCPF(): string {
  return VALID_CPFS[cpfIndex++ % VALID_CPFS.length];
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
