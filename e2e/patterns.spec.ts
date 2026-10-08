import { expect, test } from '@playwright/test';

test.describe('resource directory scenarios', () => {
  test('success supports search and pinning, and Reset demo starts over', async ({ page }) => {
    await page.goto('/patterns/resource-directory');
    await expect(page.getByRole('heading', { level: 4, name: 'Button' })).toBeVisible();
    await page.getByRole('button', { name: /^Pin\s+Button$/ }).click();
    await expect(page.getByText('1 pinned')).toBeVisible();

    await page.getByRole('searchbox', { name: 'Search' }).fill('skeleton');
    await expect(page.getByRole('status').filter({ hasText: /^Showing 1 of/ })).toBeVisible();

    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page.getByText('0 pinned')).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
  });

  test('loading stays pending and is announced', async ({ page }) => {
    await page.goto('/patterns/resource-directory');
    await page.getByRole('combobox', { name: 'Demo scenario' }).selectOption('loading');
    await expect(page.getByRole('status').filter({ hasText: 'Loading entries…' })).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.getByRole('status').filter({ hasText: 'Loading entries…' })).toBeVisible();
    await expect(page.locator('section[aria-busy="true"]')).toHaveCount(1);
  });

  test('empty explains the state and offers a next action', async ({ page }) => {
    await page.goto('/patterns/resource-directory');
    await page.getByRole('combobox', { name: 'Demo scenario' }).selectOption('empty');
    await expect(page.getByRole('heading', { name: 'No entries yet' })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Search' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Read how entries are added' }).click();
    await expect(page.locator('#contributing')).toBeFocused();
  });

  test('no results is distinct from empty and recovers with Clear filters', async ({ page }) => {
    await page.goto('/patterns/resource-directory');
    await page.getByRole('combobox', { name: 'Demo scenario' }).selectOption('noResults');
    await expect(page.getByRole('heading', { name: 'No entries match “tooltip”' })).toBeVisible();
    await page.getByRole('main').getByRole('button', { name: 'Clear filters' }).last().click();
    await expect(page.getByRole('heading', { level: 4, name: 'Button' })).toBeVisible();
  });

  test('error fails once, then Retry succeeds and focus moves to the heading', async ({ page }) => {
    await page.goto('/patterns/resource-directory');
    await page.getByRole('combobox', { name: 'Demo scenario' }).selectOption('error');
    await expect(page.getByRole('alert')).toContainText('Entries could not be loaded');
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('heading', { level: 4, name: 'Button' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'System directory' })).toBeFocused();

    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page.getByRole('alert')).toContainText('Entries could not be loaded');
  });
});

test.describe('resource detail', () => {
  test('archive is confirmed, fails once, succeeds on retry and returns focus', async ({ page }) => {
    await page.goto('/patterns/resource-detail');
    await page.getByRole('button', { name: 'Archive', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Archive Button?' });
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Archive' }).click();
    await expect(dialog.getByRole('alert')).toContainText('Button was not archived');
    await dialog.getByRole('button', { name: 'Try again' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Restore' })).toBeFocused();
    await expect(page.getByText('Button was archived. Use Restore to undo.')).toBeVisible();
  });

  test('empty shows an explained empty history', async ({ page }) => {
    await page.goto('/patterns/resource-detail');
    await page.getByRole('combobox', { name: 'Demo scenario' }).selectOption('empty');
    await page.getByRole('tab', { name: 'History (0)' }).click();
    await expect(page.getByRole('heading', { name: 'No recorded changes' })).toBeVisible();
  });
});

test.describe('activity dashboard', () => {
  test('no results and recovery', async ({ page }) => {
    await page.goto('/patterns/activity-dashboard');
    await page.getByRole('combobox', { name: 'Demo scenario' }).selectOption('noResults');
    await expect(page.getByRole('heading', { name: 'No changes match “tooltip”' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.getByRole('status').filter({ hasText: /^Showing 16 of 16 changes$/ })).toBeVisible();
  });
});

test.describe('form validation', () => {
  test('a valid proposal is sent and announced', async ({ page }) => {
    await page.goto('/patterns/form-validation');
    await page.getByRole('textbox', { name: /Component name/ }).fill('DatePicker');
    await page.getByRole('combobox', { name: /Layer/ }).selectOption('Composite');
    await page.getByRole('textbox', { name: /Summary/ }).fill('Choosing a date with keyboard and calendar support.');
    await page.getByRole('textbox', { name: /Contact email/ }).fill('team@example.com');
    await page.getByRole('checkbox', { name: /searched the directory/ }).check();
    await page.getByRole('button', { name: 'Send proposal' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Proposal for DatePicker sent.' })).toBeVisible();
  });

  test('duplicate names are rejected using the real catalog', async ({ page }) => {
    await page.goto('/patterns/form-validation');
    await page.getByRole('textbox', { name: /Component name/ }).fill('Button');
    await page.getByRole('button', { name: 'Send proposal' }).click();
    await expect(page.getByText('Button already exists. Propose a change to it instead.').first()).toBeVisible();
  });
});
