import type { ComponentPropsWithRef, ElementType } from 'react';
import styles from './Text.module.css';

export const textElements = ['p', 'span', 'div', 'small', 'strong', 'em', 'figcaption', 'dt', 'dd', 'li'] as const;
export const textVariants = ['body', 'bodySmall', 'lead', 'label', 'caption'] as const;
export const textTones = ['default', 'muted', 'brand', 'success', 'warning', 'danger', 'info'] as const;
export const textAlignments = ['start', 'center', 'end'] as const;

export type TextElement = (typeof textElements)[number];
export type TextVariant = (typeof textVariants)[number];
export type TextTone = (typeof textTones)[number];
export type TextAlignment = (typeof textAlignments)[number];

export interface TextOwnProps {
  /** Element to render. Choose by meaning; `variant` controls appearance. */
  as?: TextElement;
  /** Typography style from the typography tokens. */
  variant?: TextVariant;
  /** Text color role. Every tone meets 4.5:1 on every surface. */
  tone?: TextTone;
  /** Inline alignment. `start` and `end` follow the writing direction. */
  align?: TextAlignment;
}

export type TextProps = TextOwnProps & Omit<ComponentPropsWithRef<'p'>, keyof TextOwnProps>;

export const textDefaults = { as: 'p', variant: 'body', tone: 'default', align: 'start' } as const satisfies Required<TextOwnProps>;

/** Running text in one of the system's typography styles. */
export function Text({
  as = textDefaults.as,
  variant = textDefaults.variant,
  tone = textDefaults.tone,
  align = textDefaults.align,
  className,
  ...rest
}: TextProps) {
  const Element = as as ElementType;
  return (
    <Element
      className={[styles.text, styles[variant], styles[`tone-${tone}`], align !== 'start' && styles[align], className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}
