import type { ElementType } from 'react';
import { spaceValue, type Space } from '../tokens';
import styles from './Inline.module.css';
import { listRole, withCustomProperties, type LayoutProps } from './layoutProps';

export const inlineAlignments = ['start', 'center', 'end', 'baseline', 'stretch'] as const;
export const inlineJustifications = ['start', 'center', 'end', 'between'] as const;
export type InlineAlignment = (typeof inlineAlignments)[number];
export type InlineJustification = (typeof inlineJustifications)[number];

export interface InlineOwnProps {
  /** Space between items, horizontally and between wrapped lines. */
  gap?: Space;
  /** Block-axis alignment of items. */
  align?: InlineAlignment;
  /** Inline-axis distribution. `between` pushes the first and last items to the edges. */
  justify?: InlineJustification;
  /** Wrap onto new lines when space runs out. Turn off only when children can shrink. */
  wrap?: boolean;
}

export type InlineProps = LayoutProps<InlineOwnProps>;

export const inlineDefaults = { gap: 'small', align: 'center', justify: 'start', wrap: true } as const satisfies Required<InlineOwnProps>;

const justifyValues: Record<InlineJustification, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
};

/** Horizontal flow that wraps by default, for clusters of actions, tags and metadata. */
export function Inline({
  as = 'div',
  gap = inlineDefaults.gap,
  align = inlineDefaults.align,
  justify = inlineDefaults.justify,
  wrap = inlineDefaults.wrap,
  className,
  style,
  ref,
  ...rest
}: InlineProps) {
  const Element = as as ElementType;
  return (
    <Element
      ref={ref}
      role={listRole(as)}
      className={[styles.inline, !wrap && styles.nowrap, className].filter(Boolean).join(' ')}
      style={withCustomProperties(
        { '--_gap': spaceValue(gap), '--_align': align, '--_justify': justifyValues[justify] },
        style,
      )}
      {...rest}
    />
  );
}
