import { densityNames, productNames, themeNames, tokenSelectorIn, tokenValueIn, type ModifierInput, type ThemeName } from '@/design-system/tokens';
import { tokenManifest, type TokenRecord } from '@/design-system/tokens/manifest';

const contextsOf = { theme: themeNames, product: productNames, density: densityNames } as const;

export const permutationCount = Object.values(contextsOf).reduce((total, contexts) => total * contexts.length, 1);

export const recordOf = (path: string) => tokenManifest.find((record) => record.path === path);

/** The value a token takes in one permutation of the modifiers. */
export const resolveFor = tokenValueIn;

/** The first family in a CSS font stack, without quotes. */
export const primaryFamily = (stack: string) => stack.split(',')[0]?.trim().replace(/^"|"$/g, '') ?? stack;

/** The selector the pipeline emits a token under for one permutation: only the modifiers it depends on. */
export const selectorFor = tokenSelectorIn;

/** 1-based position of a permutation, counting theme fastest, then product, then density. */
export function permutationIndex(input: ModifierInput): number {
  return (
    densityNames.indexOf(input.density) * productNames.length * themeNames.length +
    productNames.indexOf(input.product) * themeNames.length +
    themeNames.indexOf(input.theme) +
    1
  );
}

const byProduct = (record: TokenRecord, theme: ThemeName) =>
  productNames.map((product) => resolveFor(record, { theme, product, density: densityNames[0] }));

const typeOrder = ['color', 'fontFamily'];
const rank = (record: TokenRecord) => (typeOrder.includes(record.type) ? typeOrder.indexOf(record.type) : typeOrder.length);

/**
 * Tokens a product context changes, split into those its file overrides directly (a product file
 * set the value) and those that only follow through an alias. Colors come first, then typefaces.
 */
export function productTokens(theme: ThemeName) {
  const dependent = tokenManifest.filter((record) => record.dependsOn.includes('product'));
  const direct = dependent
    .filter((record) => new Set(byProduct(record, theme).map((value) => value.source ?? record.source)).size > 1)
    .sort((a, b) => rank(a) - rank(b));
  return {
    direct: direct.map((record) => ({ record, values: byProduct(record, theme) })),
    aliases: dependent.filter((record) => !direct.includes(record)),
    shared: tokenManifest.length - dependent.length,
  };
}

const toPixels = (value: string) => {
  const match = /^(-?[\d.]+)(rem|px)$/.exec(value);
  if (!match?.[1]) return undefined;
  return match[2] === 'rem' ? Number(match[1]) * 16 : Number(match[1]);
};

/** Every token the density modifier changes, with both values in pixels at the default text size. */
export function densityTokens() {
  return tokenManifest
    .filter((record) => record.dependsOn.includes('density'))
    .map((record) => {
      const [comfortable, compact] = densityNames.map((density) => resolveFor(record, { theme: 'light', product: productNames[0], density }).resolved);
      return {
        record,
        comfortable: comfortable ?? '',
        compact: compact ?? '',
        comfortablePx: toPixels(comfortable ?? ''),
        compactPx: toPixels(compact ?? ''),
      };
    });
}
