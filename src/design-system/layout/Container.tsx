import type { ElementType } from 'react';
import { cssVar, type ContainerWidthToken } from '../tokens';
import styles from './Container.module.css';
import { withCustomProperties, type LayoutProps } from './layoutProps';

export interface ContainerOwnProps {
  /** Maximum inline size. `full` removes the cap. Default `default` (72rem). */
  width?: ContainerWidthToken | 'full';
  /** Fluid inline padding between the content and the edges. Default `true`. */
  gutters?: boolean;
  /**
   * Opt in to being a named query container (`container-type: inline-size`).
   * Descendants can then adapt with `@container` rules to this element's width.
   */
  queryName?: string;
}

export type ContainerProps = LayoutProps<ContainerOwnProps>;

/** Centers content at a readable maximum width and optionally becomes a query container. */
export function Container({
  as = 'div',
  width = 'default',
  gutters = true,
  queryName,
  className,
  style,
  ref,
  ...rest
}: ContainerProps) {
  const Element = as as ElementType;
  return (
    <Element
      ref={ref}
      className={[styles.container, gutters && styles.gutters, queryName && styles.query, className]
        .filter(Boolean)
        .join(' ')}
      style={withCustomProperties(
        { '--_max': width === 'full' ? undefined : cssVar(`size.container.${width}`) },
        queryName ? { containerName: queryName, ...style } : style,
      )}
      {...rest}
    />
  );
}
