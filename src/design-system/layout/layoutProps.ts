import type { CSSProperties, HTMLAttributes, Ref } from 'react';

/**
 * Elements a layout primitive may render. All share HTMLElement's attribute set,
 * so one props type stays honest for every choice. Forms, tables and interactive
 * elements are deliberately excluded: wrap them instead of replacing them.
 */
export type LayoutElement =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'nav'
  | 'main'
  | 'ul'
  | 'ol'
  | 'li';

export type LayoutProps<Own> = Own &
  Omit<HTMLAttributes<HTMLElement>, keyof Own> & {
    as?: LayoutElement;
    ref?: Ref<HTMLElement>;
  };

/** Merges private `--_` custom properties into a style object, skipping undefined values. */
export function withCustomProperties(
  properties: Record<`--_${string}`, string | undefined>,
  style?: CSSProperties,
): CSSProperties {
  const defined = Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined));
  return { ...defined, ...style };
}

/** Lists rendered with list-style: none lose list semantics in Safari unless the role is explicit. */
export function listRole(as: LayoutElement): 'list' | undefined {
  return as === 'ul' || as === 'ol' ? 'list' : undefined;
}
