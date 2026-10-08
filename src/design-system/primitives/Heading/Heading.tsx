import type { ComponentPropsWithRef } from 'react';
import styles from './Heading.module.css';

export const headingLevels = [1, 2, 3, 4, 5, 6] as const;
export const headingSizes = ['display', 'extraLarge', 'large', 'medium', 'small'] as const;
export const headingTones = ['default', 'muted', 'brand'] as const;
export const headingAlignments = ['start', 'center', 'end'] as const;

export type HeadingLevel = (typeof headingLevels)[number];
export type HeadingSize = (typeof headingSizes)[number];
export type HeadingTone = (typeof headingTones)[number];
export type HeadingAlignment = (typeof headingAlignments)[number];

export interface HeadingOwnProps {
  /** Document outline level. Required: choose it from the page structure, never from the desired size. */
  level: HeadingLevel;
  /** Typography style. Defaults from the level (1 → extraLarge, 2 → large, 3 → medium, 4–6 → small). */
  size?: HeadingSize;
  tone?: HeadingTone;
  align?: HeadingAlignment;
}

export type HeadingProps = HeadingOwnProps & Omit<ComponentPropsWithRef<'h1'>, keyof HeadingOwnProps>;

export const headingSizeForLevel: Record<HeadingLevel, HeadingSize> = {
  1: 'extraLarge',
  2: 'large',
  3: 'medium',
  4: 'small',
  5: 'small',
  6: 'small',
};

export const headingDefaults = { tone: 'default', align: 'start' } as const satisfies Partial<HeadingOwnProps>;

/** A section heading whose semantic level and visual size are chosen independently. */
export function Heading({
  level,
  size = headingSizeForLevel[level],
  tone = headingDefaults.tone,
  align = headingDefaults.align,
  className,
  ...rest
}: HeadingProps) {
  const Element = `h${level}` as const;
  return (
    <Element
      className={[styles.heading, styles[size], styles[`tone-${tone}`], align !== 'start' && styles[align], className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}
