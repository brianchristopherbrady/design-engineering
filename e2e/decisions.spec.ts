import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

test.describe('design decisions', () => {
  test('the section answers four questions, each linked from the landing page', async ({ page }) => {
    await page.goto('/decisions');
    await expect(page.getByRole('heading', { level: 1, name: 'Design decisions' })).toBeVisible();
    const cards = page.getByRole('list', { name: 'Design decisions' }).getByRole('listitem');
    await expect(cards).toHaveCount(4);
    await expectNoAxeViolations(page);
    await page.getByRole('link', { name: 'Sharing across products' }).first().click();
    await expect(page).toHaveURL(/\/decisions\/sharing$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Sharing across products' })).toBeFocused();
  });

  test('the sharing comparison responds to constraints without naming a winner', async ({ page }) => {
    await page.goto('/decisions/sharing#explore');
    const code = page.getByRole('listitem').filter({ hasText: 'Component code' });
    await expect(code).toContainText('One framework allows one library');
    await page.getByRole('combobox', { name: 'The mobile product is' }).selectOption('native');
    await expect(code).toContainText('Keep separate');
    await expect(code).toContainText('Native and web code cannot be shared directly');
    await expect(page.getByRole('combobox', { name: 'Web frameworks' })).toBeDisabled();
    await expect(page.getByRole('status').filter({ hasText: 'Comparison updated' })).toContainText('kept separate');
    await expectNoAxeViolations(page);
  });

  for (const id of ['planning', 'implementation', 'operating']) {
    test(`${id} passes automated accessibility checks`, async ({ page }) => {
      await page.goto(`/decisions/${id}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoAxeViolations(page);
    });
  }

  test('old Guides links lead somewhere useful', async ({ page }) => {
    await page.goto('/guides');
    await expect(page).toHaveURL(/\/decisions$/);
    await page.goto('/guides/design-tokens');
    await expect(page).toHaveURL(/\/foundations\/tokens$/);
    await page.goto('/guides/migration');
    await expect(page).toHaveURL(/\/decisions\/operating#migration$/);
    await expect(page.locator('#migration')).toBeInViewport();
    await page.goto('/guides/no-such-article');
    await expect(page).toHaveURL(/\/decisions$/);
  });

  test('fits a 320 pixel screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    for (const path of ['/decisions', '/decisions/planning', '/decisions/sharing', '/decisions/implementation', '/decisions/operating']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), path).toBe(0);
    }
  });
});
