import type { ElementType } from 'react';
import { columnWidthValue, spaceValue, type ColumnWidth, type Space } from '../tokens';
import styles from './Grid.module.css';
import { listRole, withCustomProperties, type LayoutProps } from './layoutProps';

export const gridColumnCounts = [1, 2, 3, 4, 6] as const;
export type GridColumnCount = (typeof gridColumnCounts)[number];

export const gridAlignments = ['start', 'center', 'end', 'stretch'] as const;
export type GridAlignment = (typeof gridAlignments)[number];

export interface GridOwnProps {
  /** Space between rows and columns. */
  gap?: Space;
  /** Overrides `gap` between rows only. */
  rowGap?: Space;
  /** Overrides `gap` between columns only. */
  columnGap?: Space;
  /**
   * Column count. Alone: exactly this many equal columns at every width.
   * With `minColumnWidth`: at most this many, fewer when they would get narrower than the minimum.
   */
  columns?: GridColumnCount;
  /** Smallest column width before items wrap. Alone: as many columns as fit. */
  minColumnWidth?: ColumnWidth;
  /** Block-axis alignment of items within their row. */
  align?: GridAlignment;
}

export type GridProps = LayoutProps<GridOwnProps>;

export const gridDefaults = { gap: 'medium', align: 'stretch', minColumnWidth: 'small' } as const;

/** Which column formula applies. Every prop combination maps to exactly one mode. */
export type GridMode = 'fixed' | 'responsive' | 'capped';

export function gridMode(columns: GridColumnCount | undefined, minColumnWidth: ColumnWidth | undefined): GridMode {
  if (columns === undefined) return 'responsive';
  return minColumnWidth === undefined ? 'fixed' : 'capped';
}

/** Equal columns in one of three modes: fixed count, intrinsic auto-fit, or auto-fit with a column cap. */
export function Grid({
  as = 'div',
  gap = gridDefaults.gap,
  rowGap,
  columnGap,
  columns,
  minColumnWidth,
  align = gridDefaults.align,
  className,
  style,
  ref,
  ...rest
}: GridProps) {
  const Element = as as ElementType;
  const mode = gridMode(columns, minColumnWidth);
  return (
    <Element
      ref={ref}
      role={listRole(as)}
      data-grid-mode={mode}
      className={[styles.grid, styles[mode], className].filter(Boolean).join(' ')}
      style={withCustomProperties(
        {
          '--_row-gap': spaceValue(rowGap ?? gap),
          '--_column-gap': spaceValue(columnGap ?? gap),
          '--_columns': columns === undefined ? undefined : String(columns),
          '--_min': mode === 'fixed' ? undefined : columnWidthValue(minColumnWidth ?? gridDefaults.minColumnWidth),
          '--_align': align,
        },
        style,
      )}
      {...rest}
    />
  );
}
