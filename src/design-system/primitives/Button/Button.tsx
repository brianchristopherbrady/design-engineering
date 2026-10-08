import type { ComponentPropsWithRef, ReactNode } from 'react';
import { withCustomProperties } from '../../layout';
import { radiusValue, type Radius } from '../../tokens';
import styles from './Button.module.css';

export const buttonAppearances = ['primary', 'secondary', 'ghost', 'danger'] as const;
export const buttonSizes = ['small', 'medium', 'large'] as const;
export const buttonBorders = ['none', 'thin', 'thick'] as const;

export type ButtonAppearance = (typeof buttonAppearances)[number];
export type ButtonSize = (typeof buttonSizes)[number];
export type ButtonBorder = (typeof buttonBorders)[number];

export interface ButtonOwnProps {
  /** Background treatment and emphasis. Use one `primary` per view region. */
  appearance?: ButtonAppearance;
  /** Height, inline padding and font size from the button size tokens. */
  size?: ButtonSize;
  /** Border width. The border color always comes from the appearance. */
  border?: ButtonBorder;
  /** Corner radius. Omit to use the `button.radius` component token. */
  radius?: Radius;
  /** Fill the inline size of the container. */
  fullWidth?: boolean;
  /**
   * Show a progress indicator and ignore activation while keeping focus and the accessible name.
   * Uses aria-disabled rather than disabled so keyboard focus is not lost mid-action.
   */
  loading?: boolean;
  /** Decorative icon before the label. Replaced by the progress indicator while loading. */
  iconStart?: ReactNode;
  /** Decorative icon after the label. */
  iconEnd?: ReactNode;
}

export type ButtonProps = ButtonOwnProps & Omit<ComponentPropsWithRef<'button'>, keyof ButtonOwnProps>;

export const buttonDefaults = {
  appearance: 'secondary',
  size: 'medium',
  border: 'thin',
  fullWidth: false,
  loading: false,
} as const satisfies Partial<ButtonOwnProps>;

const borderClass: Record<ButtonBorder, string | undefined> = {
  none: styles.borderNone,
  thin: styles.borderThin,
  thick: styles.borderThick,
};

/** A native button with token-backed appearance, size, border and radius choices. */
export function Button({
  appearance = buttonDefaults.appearance,
  size = buttonDefaults.size,
  border = buttonDefaults.border,
  radius,
  fullWidth = buttonDefaults.fullWidth,
  loading = buttonDefaults.loading,
  iconStart,
  iconEnd,
  type = 'button',
  className,
  style,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-disabled={loading || undefined}
      data-loading={loading || undefined}
      className={[styles.button, styles[appearance], styles[size], borderClass[border], fullWidth && styles.fullWidth, className]
        .filter(Boolean)
        .join(' ')}
      style={withCustomProperties({ '--_radius': radius && radiusValue(radius) }, style)}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        iconStart && (
          <span className={styles.icon} aria-hidden="true">
            {iconStart}
          </span>
        )
      )}
      <span className={styles.label}>{children}</span>
      {iconEnd && (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      )}
    </button>
  );
}
