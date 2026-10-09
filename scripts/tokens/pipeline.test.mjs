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

  describe('several modifiers', () => {
    /** @type {Record<string, unknown>} */
    const files = {
      'base.json': {
        color: { $type: 'color', blue: { $value: blue }, white: { $value: white }, teal: { $value: { colorSpace: 'srgb', components: [0, 0.5, 0.5] } } },
        size: { $type: 'dimension', sm: { $value: { value: 2, unit: 'rem' } }, md: { $value: { value: 3, unit: 'rem' } } },
      },
      'light.json': { action: { $type: 'color', primary: { $value: '{color.blue}' } }, surface: { $type: 'color', canvas: { $value: '{color.white}' } } },
      'dark.json': { action: { $type: 'color', primary: { $value: '{color.white}' } }, surface: { $type: 'color', canvas: { $value: '{color.blue}' } } },
      'component.json': { button: { background: { $value: '{action.primary}' }, height: { $value: '{size.md}' } } },
      'harbor.json': { action: { primary: { $value: '{color.teal}' } } },
      'compact.json': { button: { height: { $value: '{size.sm}' } } },
    };
    const resolver = {
      version: '2025.10',
      sets: { base: { sources: [{ $ref: 'base.json' }] }, component: { sources: [{ $ref: 'component.json' }] } },
      modifiers: {
        theme: { contexts: { light: [{ $ref: 'light.json' }], dark: [{ $ref: 'dark.json' }] }, default: 'light' },
        product: {
          contexts: { core: [], harbor: [{ $ref: 'harbor.json' }] },
          default: 'core',
          $extensions: { 'org.systemlab': { overrides: true } },
        },
        density: {
          contexts: { comfortable: [], compact: [{ $ref: 'compact.json' }] },
          default: 'comfortable',
          $extensions: { 'org.systemlab': { overrides: true } },
        },
      },
      resolutionOrder: [
        { $ref: '#/sets/base' },
        { $ref: '#/modifiers/theme' },
        { $ref: '#/sets/component' },
        { $ref: '#/modifiers/product' },
        { $ref: '#/modifiers/density' },
      ],
    };
    const build = (overrides = {}) =>
      buildTokenOutputs({ ...resolver, ...overrides }, (ref) => files[ref], { keyGroups: [], banner: 'test' });
    /** The token block for a selector; a color-scheme block with the same selector comes first. */
    /** @param {string} css @param {string} selector */
    const blockOf = (css, selector) => {
      const start = css.lastIndexOf(`${selector} {`);
      return start === -1 ? '' : css.slice(start, css.indexOf('}', start));
    };

    it('declares each token under exactly the modifiers it depends on', () => {
      const { css } = build();
      expect(blockOf(css, "[data-theme='dark'][data-product='harbor']")).toContain('--action-primary: var(--color-teal);');
      expect(blockOf(css, "[data-theme='dark'][data-product='core']")).toContain('--action-primary: var(--color-white);');
      expect(blockOf(css, "[data-theme='dark'][data-product='core']")).toContain('--button-background: var(--action-primary);');
      expect(blockOf(css, "[data-density='compact']")).toContain('--button-height: var(--size-sm);');
      expect(blockOf(css, "[data-theme='dark']")).toContain('--surface-canvas: var(--color-blue);');
      expect(blockOf(css, "[data-theme='dark']")).not.toContain('--button-height');
      expect(css).toContain(":root,\n  [data-theme='light'][data-product='core'] {");
    });

    it('records dependencies and every variant in the manifest', () => {
      const { manifest, permutationCount } = build();
      expect(permutationCount).toBe(8);
      expect(manifest).toContain('"dependsOn": [\n      "theme",\n      "product"\n    ]');
      expect(manifest).toContain('"product": "harbor"');
    });

    it('rejects an override modifier that introduces a new token', () => {
      /** @type {Record<string, unknown>} */
      const broken = { ...files, 'harbor.json': { brand: { $type: 'color', new: { $value: '{color.teal}' } } } };
      expect(() => buildTokenOutputs(resolver, (ref) => broken[ref], { keyGroups: [], banner: 'test' })).toThrow(/overrides nothing/);
    });

    it('rejects a second definition from a modifier that is not an override', () => {
      /** @type {any} */
      const plain = structuredClone(resolver);
      delete plain.modifiers.density.$extensions;
      expect(() => buildTokenOutputs(plain, (ref) => files[ref], { keyGroups: [], banner: 'test' })).toThrow(/defined in both/);
    });
  });

  describe('dependency policy', () => {
    const tier = (/** @type {string} */ name) => ({ 'org.systemlab': { tier: name } });
    /** @param {Record<string, unknown>} files @param {Record<string, unknown>} [modifiers] */
    const build = (files, modifiers = {}) =>
      buildTokenOutputs(
        {
          version: '2025.10',
          sets: {
            reference: { sources: [{ $ref: 'reference.json' }], $extensions: tier('reference') },
            semantic: { sources: [{ $ref: 'semantic.json' }], $extensions: tier('semantic') },
            component: { sources: [{ $ref: 'component.json' }], $extensions: tier('component') },
          },
          modifiers: {
            theme: { contexts: { light: [], dark: [] }, default: 'light', $extensions: tier('semantic') },
            ...modifiers,
          },
          resolutionOrder: [
            { $ref: '#/sets/reference' },
            { $ref: '#/sets/semantic' },
            { $ref: '#/modifiers/theme' },
            { $ref: '#/sets/component' },
            ...Object.keys(modifiers).map((name) => ({ $ref: `#/modifiers/${name}` })),
          ],
        },
        (ref) => files[ref],
        { keyGroups: [], banner: 'test' },
      );
    const reference = {
      color: { $type: 'color', blue: { $value: blue } },
      space: { $type: 'dimension', sm: { $value: { value: 0.5, unit: 'rem' } }, md: { $value: { value: 1, unit: 'rem' } } },
    };
    const semantic = { action: { $type: 'color', primary: { $value: '{color.blue}' } } };

    it('accepts component tokens that alias semantic roles or non-color reference scales', () => {
      const component = { button: { background: { $value: '{action.primary}' }, padding: { $value: '{space.md}' } } };
      expect(() => build({ 'reference.json': reference, 'semantic.json': semantic, 'component.json': component })).not.toThrow();
    });

    it('rejects a component color that aliases a palette directly (palette-isolation)', () => {
      const component = { button: { background: { $value: '{color.blue}' } } };
      expect(() => build({ 'reference.json': reference, 'semantic.json': semantic, 'component.json': component })).toThrow(
        /palette-isolation.*button\.background/,
      );
    });

    it('rejects a component token with a literal value (component-alias)', () => {
      const component = { button: { padding: { $type: 'dimension', $value: { value: 3, unit: 'px' } } } };
      expect(() => build({ 'reference.json': reference, 'semantic.json': semantic, 'component.json': component })).toThrow(/component-alias/);
    });

    it('rejects an alias that points up a tier (tier-direction)', () => {
      const upward = { ...semantic, focus: { $type: 'color', ring: { $value: '{button.background}' } } };
      const component = { button: { background: { $value: '{action.primary}' } } };
      expect(() => build({ 'reference.json': reference, 'semantic.json': upward, 'component.json': component })).toThrow(
        /tier-direction.*focus\.ring/,
      );
    });

    it('rejects a modifier that overrides a reference token (invariant-reference)', () => {
      const component = { button: { padding: { $value: '{space.md}' } } };
      const compact = { space: { md: { $value: '{space.sm}' } } };
      expect(() =>
        build(
          { 'reference.json': reference, 'semantic.json': semantic, 'component.json': component, 'compact.json': compact },
          { density: { contexts: { comfortable: [], compact: [{ $ref: 'compact.json' }] }, default: 'comfortable', $extensions: { 'org.systemlab': { tier: 'semantic', overrides: true } } } },
        ),
      ).toThrow(/invariant-reference.*space\.md/);
    });

    it('lets a modifier retune a component token instead', () => {
      const component = { button: { padding: { $value: '{space.md}' } } };
      const compact = { button: { padding: { $value: '{space.sm}' } } };
      const { manifest } = build(
        { 'reference.json': reference, 'semantic.json': semantic, 'component.json': component, 'compact.json': compact },
        { density: { contexts: { comfortable: [], compact: [{ $ref: 'compact.json' }] }, default: 'comfortable', $extensions: { 'org.systemlab': { tier: 'semantic', overrides: true } } } },
      );
      expect(manifest).toContain('"density": "compact"');
    });
  });
});
