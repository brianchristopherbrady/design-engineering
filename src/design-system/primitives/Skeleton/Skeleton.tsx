import type { ComponentPropsWithRef } from 'react';
import styles from './Skeleton.module.css';

export const skeletonShapes = ['text', 'block', 'circle'] as const;
export const skeletonSizes = ['small', 'medium', 'large'] as const;
export type SkeletonShape = (typeof skeletonShapes)[number];
export type SkeletonSize = (typeof skeletonSizes)[number];

export interface SkeletonOwnProps {
  /** `text` draws lines at the body line height; `block` and `circle` use the size tokens. */
  shape?: SkeletonShape;
  /** Number of lines for `shape="text"`. The last line is shorter. Ignored for other shapes. */
  lines?: number;
  /** Block height or circle diameter. Ignored for `shape="text"`. */
  size?: SkeletonSize;
}

export type SkeletonProps = SkeletonOwnProps & Omit<ComponentPropsWithRef<'div'>, keyof SkeletonOwnProps | 'children'>;

export const skeletonDefaults = { shape: 'text', lines: 3, size: 'medium' } as const satisfies Required<SkeletonOwnProps>;

/**
 * A placeholder for content that is loading. Always hidden from assistive technology:
 * announce loading with text (and aria-busy on the region) next to it.
 */
export function Skeleton({
  shape = skeletonDefaults.shape,
  lines = skeletonDefaults.lines,
  size = skeletonDefaults.size,
  className,
  ...rest
}: SkeletonProps) {
  const classes = [styles.skeleton, styles[shape], shape !== 'text' && styles[size], className].filter(Boolean).join(' ');
  return (
    <div aria-hidden="true" className={classes} {...rest}>
      {shape === 'text' &&
        Array.from({ length: Math.max(1, lines) }, (_, index) => <span key={index} className={styles.line} />)}
    </div>
  );
}
