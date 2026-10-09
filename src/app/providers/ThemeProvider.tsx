import { createContext, useContext, useLayoutEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { ThemeScopeProvider } from '@/design-system/layout';
import {
  densityNames,
  modifierDefaults,
  productNames,
  type DensityName,
  type ModifierInput,
  type ProductName,
  type ThemeName,
} from '@/design-system/tokens';

export type ThemePreference = 'system' | ThemeName;

const keys = { theme: 'system-lab:theme', product: 'system-lab:product', density: 'system-lab:density' } as const;

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return allowed.includes(stored as T) ? (stored as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string, fallback: string) {
  try {
    if (value === fallback) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice still applies for this visit.
  }
}

const darkQuery = '(prefers-color-scheme: dark)';
function subscribeToScheme(onChange: () => void) {
  const query = window.matchMedia?.(darkQuery);
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
}
const systemTheme = (): ThemeName => (window.matchMedia?.(darkQuery).matches ? 'dark' : 'light');

interface ThemeValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  product: ProductName;
  setProduct: (product: ProductName) => void;
  density: DensityName;
  setDensity: (density: DensityName) => void;
  /** The modifiers actually applied to the page. */
  resolved: ModifierInput;
}

const ThemeContext = createContext<ThemeValue | null>(null);

/**
 * Application-level theme, product and density. Writes all three attributes on `<html>` (the
 * generated CSS needs every modifier present on a scope), resolving "system" through
 * prefers-color-scheme, and publishes them to ThemeScope so nested scopes can inherit.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => read(keys.theme, ['light', 'dark'], 'system'));
  const [product, setProduct] = useState<ProductName>(() => read(keys.product, productNames, modifierDefaults.product));
  const [density, setDensity] = useState<DensityName>(() => read(keys.density, densityNames, modifierDefaults.density));
  const system = useSyncExternalStore(subscribeToScheme, systemTheme, () => modifierDefaults.theme);
  const theme = preference === 'system' ? system : preference;

  // Layout effect: apply before the browser paints, so the page never flashes another theme.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.product = product;
    root.dataset.density = density;
    write(keys.theme, preference, 'system');
    write(keys.product, product, modifierDefaults.product);
    write(keys.density, density, modifierDefaults.density);
  }, [theme, preference, product, density]);

  const resolved = useMemo<ModifierInput>(() => ({ theme, product, density }), [theme, product, density]);
  const value = useMemo(
    () => ({ preference, setPreference, product, setProduct, density, setDensity, resolved }),
    [preference, product, density, resolved],
  );
  return (
    <ThemeContext value={value}>
      <ThemeScopeProvider value={resolved}>{children}</ThemeScopeProvider>
    </ThemeContext>
  );
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return value;
}
