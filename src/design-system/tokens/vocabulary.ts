import { cssVar, type TokenPath } from './generated/tokens';

/**
 * Prop vocabularies shared across components, and the token each value resolves to.
 * Props use camelCase words; token paths use the token files' kebab-case names.
 * `none` values are the structural CSS value (0 or no shadow), not tokens.
 */

export const spaceScale = ['none', 'extraSmall', 'small', 'medium', 'large', 'extraLarge', 'extraExtraLarge'] as const;
export type Space = (typeof spaceScale)[number];

export const spaceTokenPaths = {
  none: null,
  extraSmall: 'spacing.extra-small',
  small: 'spacing.small',
  medium: 'spacing.medium',
  large: 'spacing.large',
  extraLarge: 'spacing.extra-large',
  extraExtraLarge: 'spacing.extra-extra-large',
} as const satisfies Record<Space, TokenPath | null>;

export const radiusScale = ['none', 'small', 'medium', 'large', 'extraLarge', 'full'] as const;
export type Radius = (typeof radiusScale)[number];

export const radiusTokenPaths = {
  none: null,
  small: 'radius.sm',
  medium: 'radius.md',
  large: 'radius.lg',
  extraLarge: 'radius.xl',
  full: 'radius.full',
} as const satisfies Record<Radius, TokenPath | null>;

export const elevationScale = ['none', 'low', 'medium', 'high'] as const;
export type Elevation = (typeof elevationScale)[number];

export const elevationTokenPaths = {
  none: null,
  low: 'elevation.low',
  medium: 'elevation.medium',
  high: 'elevation.high',
} as const satisfies Record<Elevation, TokenPath | null>;

/** Boundary strength for surfaces. Width is always the thin border token; the value picks the color role. */
export const borderScale = ['none', 'subtle', 'default', 'strong'] as const;
export type BorderStrength = (typeof borderScale)[number];

export const borderTokenPaths = {
  none: null,
  subtle: 'border.subtle',
  default: 'border.default',
  strong: 'border.strong',
} as const satisfies Record<BorderStrength, TokenPath | null>;

export const surfaceScale = ['canvas', 'panel', 'sunken', 'accent'] as const;
export type Surface = (typeof surfaceScale)[number];

export const surfaceTokenPaths = {
  canvas: 'surface.canvas',
  panel: 'surface.panel',
  sunken: 'surface.sunken',
  accent: 'surface.accent',
} as const satisfies Record<Surface, TokenPath>;

export const toneScale = ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as const;
export type Tone = (typeof toneScale)[number];

export const columnWidthScale = ['extraSmall', 'small', 'medium', 'large'] as const;
export type ColumnWidth = (typeof columnWidthScale)[number];

export const columnWidthTokenPaths = {
  extraSmall: 'size.item.xs',
  small: 'size.item.sm',
  medium: 'size.item.md',
  large: 'size.item.lg',
} as const satisfies Record<ColumnWidth, TokenPath>;

/** CSS value for a vocabulary entry: a var() reference, or the structural fallback for `none`. */
function valueOf(path: TokenPath | null, none: string): string {
  return path ? cssVar(path) : none;
}

export const spaceValue = (space: Space) => valueOf(spaceTokenPaths[space], '0');
export const radiusValue = (radius: Radius) => valueOf(radiusTokenPaths[radius], '0');
export const elevationValue = (elevation: Elevation) => valueOf(elevationTokenPaths[elevation], 'none');
export const borderValue = (border: BorderStrength) => valueOf(borderTokenPaths[border], 'transparent');
export const surfaceValue = (surface: Surface) => cssVar(surfaceTokenPaths[surface]);
export const columnWidthValue = (width: ColumnWidth) => cssVar(columnWidthTokenPaths[width]);
