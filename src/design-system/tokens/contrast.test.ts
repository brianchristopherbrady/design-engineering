import { describe, expect, it } from 'vitest';
import { tokenManifest } from './generated/manifest';
import { productNames, themeNames, type ProductName, type ThemeName, type TokenPath } from './generated/tokens';

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two opaque sRGB colors. */
function contrastRatio(a: string, b: string) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}

function color(path: TokenPath, theme: ThemeName, product: ProductName) {
  const record = tokenManifest.find((token) => token.path === path);
  if (!record || record.type !== 'color') throw new Error(`${path} is not a color token`);
  const wanted: Record<string, string> = { theme, product, density: 'comfortable' };
  const variant = record.variants?.find((candidate) =>
    Object.entries(candidate.input).every(([modifier, context]) => wanted[modifier] === context),
  );
  const value = (variant ?? record.values[theme]).resolved;
  if (!/^#[0-9a-f]{6}$/.test(value)) throw new Error(`${path} must resolve to an opaque hex color, got ${value}`);
  return value;
}

const surfaces: TokenPath[] = ['surface.canvas', 'surface.panel', 'surface.sunken', 'surface.accent'];
const tones = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const;
const opaqueButtons = ['primary', 'secondary', 'danger'] as const;

/** [foreground, background, minimum ratio, reason] */
const requirements: [TokenPath, TokenPath, number, string][] = [
  ...surfaces.flatMap((surface): [TokenPath, TokenPath, number, string][] => [
    ['text.primary', surface, 4.5, 'body text'],
    ['text.muted', surface, 4.5, 'secondary text'],
    ['text.link', surface, 4.5, 'link text'],
    ['border.strong', surface, 3, 'control boundary (1.4.11)'],
    ['focus.ring', surface, 3, 'focus indicator (1.4.11)'],
    ['signal.current', surface, 3, 'current-location indicator (1.4.11)'],
    ['button.ghost.foreground', surface, 4.5, 'ghost button label (transparent background)'],
    ...tones.map((tone): [TokenPath, TokenPath, number, string] => [`tone.${tone}.text`, surface, 4.5, `${tone} text and outlined badge`]),
  ]),
  ...opaqueButtons.flatMap((appearance): [TokenPath, TokenPath, number, string][] => [
    [`button.${appearance}.foreground`, `button.${appearance}.background`, 4.5, `${appearance} button label`],
    [`button.${appearance}.foreground`, `button.${appearance}.background-hover`, 4.5, `${appearance} button label on hover`],
    [`button.${appearance}.foreground`, `button.${appearance}.background-active`, 4.5, `${appearance} button label when pressed`],
  ]),
  ['button.ghost.foreground', 'button.ghost.background-hover', 4.5, 'ghost button label on hover'],
  ['button.ghost.foreground', 'button.ghost.background-active', 4.5, 'ghost button label when pressed'],
  ['input.border', 'input.background', 3, 'input boundary'],
  ['input.border', 'surface.panel', 3, 'switch track boundary'],
  ['switch.track-on', 'surface.canvas', 3, 'switch on state'],
  ['switch.track-on', 'surface.panel', 3, 'switch on state'],
  ...tones.flatMap((tone): [TokenPath, TokenPath, number, string][] => [
    [`tone.${tone}.text`, `tone.${tone}.surface`, 4.5, `${tone} subtle badge and alert text`],
    [`tone.${tone}.on-solid`, `tone.${tone}.solid`, 4.5, `${tone} filled badge text`],
    ['text.primary', `tone.${tone}.surface`, 4.5, `${tone} alert body text`],
  ]),
  ...(['success', 'warning', 'danger', 'info'] as const).map((tone): [TokenPath, TokenPath, number, string] => [
    `tone.${tone}.border`,
    'surface.panel',
    3,
    `${tone} alert and invalid-field border`,
  ]),
];

describe('token contrast', () => {
  for (const product of productNames) {
    for (const theme of themeNames) {
      describe(`${product}, ${theme} theme`, () => {
        it.each(requirements)('%s on %s meets %s:1 (%s)', (foreground, background, minimum) => {
          expect(contrastRatio(color(foreground, theme, product), color(background, theme, product))).toBeGreaterThanOrEqual(minimum);
        });
      });
    }
  }
});
