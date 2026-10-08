import { expect, test, type Page } from '@playwright/test';

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

const reflowPages = [
  '/',
  '/foundations/tokens',
  '/foundations/color',
  '/foundations/spacing',
  '/components',
  '/components/button',
  '/components/grid',
  '/components/dialog',
  '/playground?component=button',
  '/playground?component=grid',
  '/patterns/resource-directory',
  '/patterns/activity-dashboard',
  '/patterns/form-validation',
];

test.describe('reflow at 320 CSS pixels (WCAG 1.4.10)', () => {
  test.use({ viewport: { width: 320, height: 720 } });

  for (const path of reflowPages) {
    test(`no horizontal scrolling on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await horizontalOverflow(page)).toBe(0);
    });
  }

  test('section navigation collapses behind a toggle', async ({ page }) => {
    await page.goto('/components/button');
    const toggle = page.getByRole('button', { name: 'Show components' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('navigation', { name: 'Components' }).getByRole('link', { name: 'Badge' })).toBeHidden();
    await toggle.click();
    await page.getByRole('navigation', { name: 'Components' }).getByRole('link', { name: 'Badge' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Badge' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Show components' })).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('container queries', () => {
  test('EntryCard adapts to its container, not the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/foundations/responsive');
    const range = page.getByRole('slider', { name: 'Container width' });
    const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Card', exact: true }) }).last();
    const pin = card.getByRole('button', { name: /^Pin/ });
    const title = card.getByRole('heading');

    await range.fill('64');
    const wide = { pin: await pin.boundingBox(), title: await title.boundingBox() };
    await range.fill('18');
    const narrow = { pin: await pin.boundingBox(), title: await title.boundingBox() };

    // Wide: the pin button sits beside the text. Narrow: below it.
    expect(wide.pin!.y).toBeLessThan(wide.title!.y + wide.title!.height);
    expect(narrow.pin!.y).toBeGreaterThan(narrow.title!.y + narrow.title!.height);
  });

  test('documentation pages show a contents column only when the page container is wide', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/components/button');
    const contents = page.getByRole('navigation', { name: 'On this page' });
    const main = page.getByRole('heading', { name: 'Overview', level: 2 });
    const wideContents = await contents.boundingBox();
    const wideMain = await main.boundingBox();
    expect(wideContents!.x).toBeGreaterThan(wideMain!.x);

    await page.setViewportSize({ width: 900, height: 900 });
    const narrowContents = await contents.boundingBox();
    const narrowMain = await main.boundingBox();
    expect(narrowContents!.y).toBeLessThan(narrowMain!.y);
  });
});

test.describe('URL state', () => {
  test('component filters live in the URL and follow Back and Forward', async ({ page }) => {
    await page.goto('/components');
    await page.getByRole('combobox', { name: 'Layer' }).selectOption('Composite');
    await expect(page).toHaveURL(/layer=Composite/);
    await expect(page.getByRole('heading', { level: 2, name: /^Primitive/ })).toHaveCount(0);

    await page.goBack();
    await expect(page).not.toHaveURL(/layer=/);
    await expect(page.getByRole('heading', { level: 2, name: /^Primitive/ })).toBeVisible();

    await page.goForward();
    await expect(page.getByRole('combobox', { name: 'Layer' })).toHaveValue('Composite');

    await page.goto('/components?q=zzz');
    await expect(page.getByRole('heading', { name: 'No components match these filters' })).toBeVisible();
  });
});
