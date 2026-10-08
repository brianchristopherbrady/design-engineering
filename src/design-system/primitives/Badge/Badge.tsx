import type { ComponentPropsWithRef, ReactNode } from 'react';
import { withCustomProperties } from '../../layout';
import { radiusValue, type Radius, type Tone } from '../../tokens';
import styles from './Badge.module.css';

export const badgeAppearances = ['filled', 'subtle', 'outlined'] as const;
export const badgeSizes = ['small', 'medium', 'large'] as const;

export type BadgeAppearance = (typeof badgeAppearances)[number];
export type BadgeSize = (typeof badgeSizes)[number];

export interface BadgeOwnProps {
  /** Color role. Color is never the only cue: the label must state the meaning. */
  tone?: Tone;
  /** How strongly the tone is applied: solid fill, tinted fill, or outline only. */
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  /** Corner radius. Omit to use the `badge.radius` component token (full). */
  radius?: Radius;
  /** Decorative icon before the label. */
  icon?: ReactNode;
}

export type BadgeProps = BadgeOwnProps & Omit<ComponentPropsWithRef<'span'>, keyof BadgeOwnProps>;

export const badgeDefaults = { tone: 'neutral', appearance: 'subtle', size: 'medium' } as const satisfies Partial<BadgeOwnProps>;

/** A short, non-interactive label for status or category. */
export function Badge({
  tone = badgeDefaults.tone,
  appearance = badgeDefaults.appearance,
  size = badgeDefaults.size,
  radius,
  icon,
  className,
  style,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[`tone-${tone}`], styles[appearance], styles[size], className].filter(Boolean).join(' ')}
      style={withCustomProperties({ '--_radius': radius && radiusValue(radius) }, style)}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
