import type { ElementType } from 'react';
import { spaceValue, type Space } from '../tokens';
import { listRole, withCustomProperties, type LayoutProps } from './layoutProps';
import styles from './Stack.module.css';

export const stackAlignments = ['start', 'center', 'end', 'stretch'] as const;
export type StackAlignment = (typeof stackAlignments)[number];

export interface StackOwnProps {
  /** Space between children. */
  gap?: Space;
  /** Inline-axis alignment of children. `stretch` makes them fill the width. */
  align?: StackAlignment;
}

export type StackProps = LayoutProps<StackOwnProps>;

export const stackDefaults = { gap: 'medium', align: 'stretch' } as const satisfies Required<StackOwnProps>;

/** Vertical flow with one gap between children. Renders lists with an explicit list role. */
export function Stack({
  as = 'div',
  gap = stackDefaults.gap,
  align = stackDefaults.align,
  className,
  style,
  ref,
  ...rest
}: StackProps) {
  const Element = as as ElementType;
  return (
    <Element
      ref={ref}
      role={listRole(as)}
      className={[styles.stack, className].filter(Boolean).join(' ')}
      style={withCustomProperties({ '--_gap': spaceValue(gap), '--_align': align }, style)}
      {...rest}
    />
  );
}
