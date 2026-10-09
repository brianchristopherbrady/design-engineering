import { createContext, useContext, useMemo, type ElementType, type ReactNode } from 'react';
import { modifierDefaults, type DensityName, type ModifierInput, type ProductName, type ThemeName } from '../tokens';
import type { LayoutProps } from './layoutProps';

const ScopeContext = createContext<ModifierInput>(modifierDefaults);

/** The theme, product and density in effect for the calling component. */
export function useThemeScope(): ModifierInput {
  return useContext(ScopeContext);
}

/**
 * Publishes modifier values without rendering an element. For roots that set the
 * attributes themselves, such as an app provider that writes them on `<html>`.
 */
export function ThemeScopeProvider({ value, children }: { value: ModifierInput; children: ReactNode }) {
  return <ScopeContext value={value}>{children}</ScopeContext>;
}

export interface ThemeScopeOwnProps {
  /** Color theme. Omit to inherit from the nearest scope. */
  theme?: ThemeName;
  /** Product brand and shape. Omit to inherit. */
  product?: ProductName;
  /** Spacing and control size. Omit to inherit. */
  density?: DensityName;
}

export type ThemeScopeProps = LayoutProps<ThemeScopeOwnProps>;

/**
 * Re-themes a region. It always writes every modifier attribute, filling the ones you omit
 * from the nearest parent scope, because the generated CSS declares each token under the exact
 * combination of modifiers it depends on, and a token is only recomputed where it is declared.
 */
export function ThemeScope({ as = 'div', theme, product, density, ref, children, ...rest }: ThemeScopeProps) {
  const parent = useContext(ScopeContext);
  const value = useMemo<ModifierInput>(
    () => ({ theme: theme ?? parent.theme, product: product ?? parent.product, density: density ?? parent.density }),
    [theme, product, density, parent],
  );
  const Element = as as ElementType;
  return (
    <ScopeContext value={value}>
      <Element ref={ref} data-theme={value.theme} data-product={value.product} data-density={value.density} {...rest}>
        {children}
      </Element>
    </ScopeContext>
  );
}
