import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import { withCustomProperties } from '../../layout';
import {
  borderValue,
  elevationValue,
  radiusValue,
  spaceValue,
  surfaceValue,
  type BorderStrength,
  type Elevation,
  type Radius,
  type Space,
  type Surface,
} from '../../tokens';
import styles from './Card.module.css';

export const cardElements = ['div', 'article', 'section', 'li'] as const;
export type CardElement = (typeof cardElements)[number];

export interface CardOwnProps {
  /** Element to render. Use `article` for self-contained items and `li` inside lists. */
  as?: CardElement;
  /** Background role. Omit to use `card.background`. */
  surface?: Surface;
  /** Padding around every region. Omit to use `card.padding`. */
  padding?: Space;
  /** Corner radius. Omit to use `card.radius`. */
  radius?: Radius;
  /** Border color strength (thin width). Omit to use `card.border`. */
  border?: BorderStrength;
  /** Shadow depth. Omit to use `card.elevation`. */
  elevation?: Elevation;
  /** Region above the body, such as a title and badges. */
  header?: ReactNode;
  /** Region below the body, such as actions or metadata. */
  footer?: ReactNode;
  children?: ReactNode;
}

export type CardProps = CardOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof CardOwnProps> & {
    ref?: Ref<HTMLElement>;
  };

/** Documented values of the component tokens used when a prop is omitted. */
export const cardTokenDefaults = {
  surface: 'card.background → surface.panel',
  padding: 'card.padding → spacing.large',
  radius: 'card.radius → radius.lg',
  border: 'card.border → border.subtle',
  elevation: 'card.elevation → elevation.low',
} as const satisfies Record<'surface' | 'padding' | 'radius' | 'border' | 'elevation', string>;

/**
 * A bounded surface with optional header and footer regions. Purely visual: put real links
 * and buttons inside it rather than making the whole card clickable.
 */
export function Card({
  as = 'div',
  surface,
  padding,
  radius,
  border,
  elevation,
  header,
  footer,
  className,
  style,
  children,
  ref,
  ...rest
}: CardProps) {
  const Element = as as ElementType;
  return (
    <Element
      ref={ref}
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={withCustomProperties(
        {
          '--_background': surface && surfaceValue(surface),
          '--_padding': padding && spaceValue(padding),
          '--_radius': radius && radiusValue(radius),
          '--_border': border && borderValue(border),
          '--_elevation': elevation && elevationValue(elevation),
        },
        style,
      )}
      {...rest}
    >
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Element>
  );
}
