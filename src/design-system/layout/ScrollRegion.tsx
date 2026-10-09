import type { HTMLAttributes, Ref } from 'react';
import styles from './ScrollRegion.module.css';

export const scrollRegionAxes = ['inline', 'both'] as const;
export type ScrollRegionAxis = (typeof scrollRegionAxes)[number];

interface ScrollRegionBaseProps {
  /** `inline`: wide tables and rows scroll sideways. `both`: tall content also scrolls, capped by `maxBlockSize`. */
  axis?: ScrollRegionAxis;
  /** Maximum block size when `axis="both"`, such as `"30rem"`. Ignored for `inline`. */
  maxBlockSize?: string;
  /** Render as `pre` for code, keeping whitespace. */
  as?: 'div' | 'pre';
  ref?: Ref<HTMLElement>;
}

/** A keyboard-scrollable region must have a name, so exactly one of these is required. */
type ScrollRegionName = { 'aria-label': string; 'aria-labelledby'?: never } | { 'aria-labelledby': string; 'aria-label'?: never };

export type ScrollRegionOwnProps = ScrollRegionBaseProps & ScrollRegionName;

export type ScrollRegionProps = ScrollRegionOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof ScrollRegionBaseProps | 'aria-label' | 'aria-labelledby' | 'role' | 'tabIndex'>;

export const scrollRegionDefaults = { axis: 'inline', as: 'div' } as const satisfies Partial<ScrollRegionBaseProps>;

/**
 * Lets wide or tall content scroll inside the page instead of the page scrolling sideways
 * (WCAG 1.4.10). It is a focusable, named region so keyboard users can scroll it (WCAG 2.1.1),
 * and its focus ring is drawn inside so clipping ancestors cannot hide it.
 */
export function ScrollRegion({
  axis = scrollRegionDefaults.axis,
  maxBlockSize,
  as: Element = scrollRegionDefaults.as,
  className,
  style,
  ref,
  ...rest
}: ScrollRegionProps) {
  return (
    <Element
      ref={ref as Ref<HTMLDivElement & HTMLPreElement>}
      role="region"
      tabIndex={0}
      className={[styles.region, styles[axis], className].filter(Boolean).join(' ')}
      style={axis === 'both' && maxBlockSize ? { maxBlockSize, ...style } : style}
      {...rest}
    />
  );
}
