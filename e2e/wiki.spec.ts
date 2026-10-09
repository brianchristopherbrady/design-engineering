import { expect, test } from '@playwright/test';
import { expectNoAxeViolations } from './axe';

test.describe('design system wiki', () => {
  test('the home lists every article by group', async ({ page }) => {
    await page.goto('/guides');
    await expect(page.getByRole('heading', { level: 1, name: 'Design system wiki' })).toBeVisible();
    for (const group of ['Introduction', 'The parts of a system', 'Running a system', 'Across products and platforms']) {
      await expect(page.getByRole('heading', { level: 2, name: group })).toBeVisible();
    }
    await expect(page.getByRole('main').getByRole('link', { name: 'Migrating existing products' })).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('an article reads top to bottom and leads to the next one', async ({ page }) => {
    await page.goto('/guides/design-tokens');
    await expect(page.getByRole('heading', { level: 1, name: 'Design tokens' })).toBeVisible();
    await expect(page.getByText('In short')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'In existing products' })).toBeVisible();
    await expectNoAxeViolations(page);

    await page.getByRole('navigation', { name: 'Previous and next article' }).getByRole('link', { name: /Next/ }).click();
    await expect(page).toHaveURL(/\/guides\/primitives$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Primitives' })).toBeVisible();
  });

  for (const id of ['start', 'primitives', 'composites', 'migration', 'sharing']) {
    test(`${id} passes automated accessibility checks`, async ({ page }) => {
      await page.goto(`/guides/${id}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoAxeViolations(page);
    });
  }

  test('fits a 320 pixel screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    for (const id of ['start', 'design-tokens', 'primitives', 'migration', 'sharing']) {
      await page.goto(`/guides/${id}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), id).toBe(0);
    }
  });
});
