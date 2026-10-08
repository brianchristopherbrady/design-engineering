import { expect, test, type Locator, type Page } from '@playwright/test';

const cssVar = (page: Page, name: string, scope?: Locator) =>
  (scope ?? page.locator('html')).evaluate((element, variable) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${variable})`;
    element.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);

test.describe('playground', () => {
  test('controls change real props, the snippet and the rendered tokens together', async ({ page }) => {
    await page.goto('/playground?component=button');
    const preview = page.getByTestId('playground-preview');
    const snippet = page.getByTestId('playground-snippet');
    const button = preview.getByRole('button', { name: 'Save changes' });

    await page.getByRole('combobox', { name: 'appearance' }).selectOption('danger');
    await expect(snippet).toContainText('appearance="danger"');
    await expect(button).toHaveCSS('background-color', await cssVar(page, '--button-danger-background', preview));

    await page.getByRole('combobox', { name: 'size' }).selectOption('large');
    await expect(snippet).toContainText('size="large"');
    const height = await button.evaluate((element) => element.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(52);

    await page.getByRole('switch', { name: 'fullWidth' }).check();
    await expect(snippet).toContainText('fullWidth={true}');

    await page.getByRole('textbox', { name: 'children' }).fill('Delete entry');
    await expect(preview.getByRole('button', { name: 'Delete entry' })).toBeVisible();
    await expect(snippet).toContainText('Delete entry');

    await page.getByRole('button', { name: 'Reset controls' }).click();
    await expect(snippet).toContainText('appearance="secondary"');
    await expect(snippet).toContainText('fullWidth={false}');
  });

  test('presets apply several props at once', async ({ page }) => {
    await page.goto('/playground?component=badge');
    await page.getByRole('button', { name: 'Danger filled' }).click();
    const snippet = page.getByTestId('playground-snippet');
    await expect(snippet).toContainText('tone="danger"');
    await expect(snippet).toContainText('appearance="filled"');
    await expect(snippet).toContainText('icon={<Icon name="danger" />}');
    await expect(page.getByRole('combobox', { name: 'tone' })).toHaveValue('danger');
  });

  test('the preview theme is scoped to the preview', async ({ page }) => {
    await page.goto('/playground?component=card');
    const preview = page.getByTestId('playground-preview');
    await page.getByRole('combobox', { name: 'Preview theme' }).selectOption('dark');
    await expect(preview).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    const pageCanvas = await cssVar(page, '--surface-canvas');
    const previewCanvas = await cssVar(page, '--surface-canvas', preview);
    expect(previewCanvas).not.toBe(pageCanvas);
  });

  test('the preview resizes independently of the window', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/playground?component=grid');
    const preview = page.getByTestId('playground-preview');
    await page.getByRole('button', { name: 'Narrow (320px)' }).click();
    await expect(page.getByRole('button', { name: 'Narrow (320px)' })).toHaveAttribute('aria-pressed', 'true');
    expect(Math.round((await preview.boundingBox())?.width ?? 0)).toBe(320);
    expect(page.viewportSize()?.width).toBe(1400);
    const narrowColumns = await preview.locator('[data-grid-mode]').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);

    await page.getByRole('button', { name: 'Fill' }).click();
    const wideColumns = await preview.locator('[data-grid-mode]').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(narrowColumns).toBe(1);
    expect(wideColumns).toBeGreaterThan(1);
  });

  test('the selected component is in the URL and links to its documentation', async ({ page }) => {
    await page.goto('/playground');
    await page.getByRole('combobox', { name: 'Component' }).selectOption('dialog');
    await expect(page).toHaveURL(/component=dialog/);
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog', { name: 'Archive this entry?' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: /Dialog documentation/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Dialog' })).toBeVisible();
  });

  test('component pages link to their playground story', async ({ page }) => {
    await page.goto('/components/badge');
    await page.getByRole('link', { name: 'Open in playground' }).click();
    await expect(page).toHaveURL(/\/playground\?component=badge/);
    await expect(page.getByRole('combobox', { name: 'Component' })).toHaveValue('badge');
  });
});
