import type { ElementType } from 'react';
import {
  borderValue,
  radiusValue,
  spaceValue,
  surfaceValue,
  type BorderStrength,
  type Radius,
  type Space,
  type Surface,
} from '../tokens';
import styles from './Box.module.css';
import { withCustomProperties, type LayoutProps } from './layoutProps';

export interface BoxOwnProps {
  /** Padding on every side, from the spacing vocabulary. */
  padding?: Space;
  /** Semantic surface role for the background. Omit for transparent. */
  background?: Surface;
  /** Boundary strength. Uses the thin border width. */
  border?: BorderStrength;
  radius?: Radius;
}

export type BoxProps = LayoutProps<BoxOwnProps>;

export const boxDefaults = { padding: 'none', border: 'none', radius: 'none' } as const satisfies Partial<BoxOwnProps>;

/** A plain surface: token-based padding, background, border and radius around any content. */
export function Box({
  as = 'div',
  padding = boxDefaults.padding,
  background,
  border = boxDefaults.border,
  radius = boxDefaults.radius,
  className,
  style,
  ref,
  ...rest
}: BoxProps) {
  const Element = as as ElementType;
  return (
    <Element
      ref={ref}
      className={[styles.box, border !== 'none' && styles.bordered, className].filter(Boolean).join(' ')}
      style={withCustomProperties(
        {
          '--_padding': spaceValue(padding),
          '--_background': background && surfaceValue(background),
          '--_border': borderValue(border),
          '--_radius': radiusValue(radius),
        },
        style,
      )}
      {...rest}
    />
  );
}
