import { useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { LinkProvider } from '@/design-system/primitives';
import { ThemeProvider } from './ThemeProvider';

/** Composes the app-wide providers. Each one owns a single concern. */
export function AppProviders({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const navigateTo = useCallback((href: string) => void navigate(href), [navigate]);

  return (
    <ThemeProvider>
      <LinkProvider navigate={navigateTo}>{children}</LinkProvider>
    </ThemeProvider>
  );
}
