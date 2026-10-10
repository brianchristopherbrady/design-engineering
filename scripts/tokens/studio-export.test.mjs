// @ts-check
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { tokenManifest } from '../../src/design-system/tokens/generated/manifest';
import { assignRoles, exportProduct, generateRamp } from '../../src/features/theming/brand';
import { tokenSourceDir } from './build-tokens.mjs';
import { buildTokenOutputs } from './pipeline.mjs';

/** @param {string} ref */
const read = (ref) => JSON.parse(readFileSync(join(tokenSourceDir, ref), 'utf8'));

/**
 * Deep-merges plain objects, as a reviewer merging the studio's pieces into the source files would.
 * @param {Record<string, unknown>} target @param {Record<string, unknown>} patch @returns {Record<string, unknown>}
 */
function merge(target, patch) {
  /** @type {(value: unknown) => value is Record<string, unknown>} */
  const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
  const merged = { ...target };
  for (const [key, value] of Object.entries(patch)) {
    const existing = merged[key];
    merged[key] = isObject(value) && isObject(existing) ? merge(existing, value) : value;
  }
  return merged;
}

/** @param {string} path @param {'light' | 'dark'} theme */
const resolved = (path, theme) => tokenManifest.find((record) => record.path === path)?.values[theme].resolved ?? '';
/** @param {'light' | 'dark'} theme */
const surfaces = (theme) => ({ canvas: resolved('surface.canvas', theme), panel: resolved('surface.panel', theme), sunken: resolved('surface.sunken', theme) });

describe('theme studio export', () => {
  it('builds with the real token sources and pipeline once merged', () => {
    const brand = '#2563eb';
    const ramp = generateRamp(brand);
    const roles = { light: assignRoles(ramp, 'light', surfaces('light')).roles, dark: assignRoles(ramp, 'dark', surfaces('dark')).roles };
    const files = new Map(exportProduct({ id: 'clavius', brand, shape: 'pill', ramp, roles }).map((file) => [file.key, file.content]));
    /** @param {'product' | 'ramp' | 'light' | 'dark' | 'resolver'} key @returns {Record<string, unknown>} */
    const piece = (key) => JSON.parse(files.get(key) ?? '{}');
    /** @type {Record<string, unknown>} */
    const sources = {
      'reference.modes.tokens.json': merge(read('reference.modes.tokens.json'), piece('ramp')),
      'brands.light.tokens.json': merge(read('brands.light.tokens.json'), piece('light')),
      'brands.dark.tokens.json': merge(read('brands.dark.tokens.json'), piece('dark')),
      'product.clavius.tokens.json': piece('product'),
    };
    const resolver = /** @type {import('./pipeline.mjs').ResolverDocument} */ (merge(read('system-lab.resolver.json'), piece('resolver')));

    const { css } = buildTokenOutputs(resolver, (ref) => sources[ref] ?? read(ref), { keyGroups: [], banner: 'test' });
    expect(css).toContain("[data-theme='dark'][data-product='clavius']");
    expect(css).toContain('--action-primary-background: var(--brand-clavius-strong);');
    expect(css).toContain('--signal-current: var(--brand-clavius-border);');
    expect(css).toContain('--brand-clavius-glow: var(--color-clavius-glow);');
    expect(css).toContain('--card-radius: var(--radius-xl);');
  });
});
