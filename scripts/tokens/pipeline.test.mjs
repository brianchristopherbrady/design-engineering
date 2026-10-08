// @ts-check
import { describe, expect, it } from 'vitest';
import { buildTokenOutputs, cssDeclarations, flattenTokens, mergeTokens, resolveTokens, TokenError } from './pipeline.mjs';

const blue = { colorSpace: 'srgb', components: [0, 0.4, 0.8], hex: '#0066cc' };
const white = { colorSpace: 'srgb', components: [1, 1, 1], hex: '#ffffff' };

/** @param {unknown} document */
const resolve = (document) => resolveTokens(mergeTokens([flattenTokens(document, 'test.tokens.json', 'test')]));

describe('token pipeline', () => {
  it('inherits $type from groups and resolves alias chains', () => {
    const tokens = resolve({
      color: { $type: 'color', blue: { $value: blue } },
      action: { primary: { $value: '{color.blue}' } },
      button: { background: { $value: '{action.primary}' } },
    });
    const button = tokens.get('button.background');
    expect(button?.type).toBe('color');
    expect(button?.chain).toEqual(['button.background', 'action.primary', 'color.blue']);
    expect(button?.resolved).toEqual(blue);
  });

  it('keeps aliases as var() references in CSS', () => {
    const definitions = mergeTokens([
      flattenTokens({ color: { $type: 'color', blue: { $value: blue } }, link: { $value: '{color.blue}' } }, 'a', 'test'),
    ]);
    const resolved = resolveTokens(definitions);
    const link = resolved.get('link');
    expect(link && cssDeclarations(link, definitions)).toEqual([['--link', 'var(--color-blue)']]);
  });

  it('fails on a missing reference and names it', () => {
    expect(() => resolve({ color: { $type: 'color', link: { $value: '{color.blu}' } } })).toThrow(/Missing reference \{color\.blu\}/);
  });

  it('fails on circular references and shows the cycle', () => {
    expect(() =>
      resolve({
        a: { $type: 'color', $value: '{b}' },
        b: { $type: 'color', $value: '{c}' },
        c: { $type: 'color', $value: '{a}' },
      }),
    ).toThrow(/Circular reference: \{a\} → \{b\} → \{c\} → \{a\}/);
  });

  it('fails when an alias points at a token of another type', () => {
    expect(() =>
      resolve({
        space: { md: { $type: 'dimension', $value: { value: 1, unit: 'rem' } } },
        text: { $type: 'color', primary: { $value: '{space.md}' } },
      }),
    ).toThrow(TokenError);
  });

  it('rejects values that do not match their type', () => {
    expect(() => resolve({ space: { $type: 'dimension', md: { $value: { value: 1, unit: 'em' } } } })).toThrow(/px.*rem/);
    expect(() => resolve({ c: { $type: 'color', $value: { ...blue, hex: '#ff0000' } } })).toThrow(/does not match/);
  });

  it('rejects tokens without a type', () => {
    expect(() => resolve({ loose: { $value: 4 } })).toThrow(/no \$type/);
  });

  it('rejects a path defined twice', () => {
    const doc = { c: { $type: 'color', $value: blue } };
    expect(() => mergeTokens([flattenTokens(doc, 'one', 't'), flattenTokens(doc, 'two', 't')])).toThrow(/both one and two/);
  });

  it('requires every theme to define the same tokens', () => {
    /** @type {Record<string, unknown>} */
    const files = {
      'base.json': { color: { $type: 'color', blue: { $value: blue }, white: { $value: white } } },
      'light.json': { surface: { $type: 'color', canvas: { $value: '{color.white}' } } },
      'dark.json': { surface: { $type: 'color', panel: { $value: '{color.blue}' } } },
    };
    const resolver = {
      version: '2025.10',
      sets: { base: { sources: [{ $ref: 'base.json' }] } },
      modifiers: { theme: { contexts: { light: [{ $ref: 'light.json' }], dark: [{ $ref: 'dark.json' }] }, default: 'light' } },
      resolutionOrder: [{ $ref: '#/sets/base' }, { $ref: '#/modifiers/theme' }],
    };
    expect(() => buildTokenOutputs(resolver, (ref) => files[ref], { keyGroups: [], banner: 'test' })).toThrow(
      /Theme contexts must define the same tokens/,
    );
  });

  it('emits theme-dependent tokens, including aliases of them, in every theme block', () => {
    /** @type {Record<string, unknown>} */
    const files = {
      'base.json': { color: { $type: 'color', blue: { $value: blue }, white: { $value: white } } },
      'light.json': { surface: { $type: 'color', canvas: { $value: '{color.white}' } } },
      'dark.json': { surface: { $type: 'color', canvas: { $value: '{color.blue}' } } },
      'component.json': { card: { background: { $value: '{surface.canvas}' } } },
    };
    const resolver = {
      version: '2025.10',
      sets: { base: { sources: [{ $ref: 'base.json' }] }, component: { sources: [{ $ref: 'component.json' }] } },
      modifiers: { theme: { contexts: { light: [{ $ref: 'light.json' }], dark: [{ $ref: 'dark.json' }] }, default: 'light' } },
      resolutionOrder: [{ $ref: '#/sets/base' }, { $ref: '#/modifiers/theme' }, { $ref: '#/sets/component' }],
    };
    const { css } = buildTokenOutputs(resolver, (ref) => files[ref], { keyGroups: [], banner: 'test' });
    const darkBlock = css.slice(css.indexOf("[data-theme='dark']"));
    expect(darkBlock).toContain('--surface-canvas: var(--color-blue);');
    expect(darkBlock).toContain('--card-background: var(--surface-canvas);');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
  });
});
