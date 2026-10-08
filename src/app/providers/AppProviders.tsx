import { useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { LinkProvider } from '@/design-system/primitives';
import { basePath } from '../paths';
import { ThemeProvider } from './ThemeProvider';

const resolveHref = (href: string) => `${basePath}${href}`;

/** Composes the app-wide providers. Each one owns a single concern. */
export function AppProviders({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const navigateTo = useCallback((href: string) => void navigate(href), [navigate]);

  return (
    <ThemeProvider>
      <LinkProvider navigate={navigateTo} resolveHref={resolveHref}>
        {children}
      </LinkProvider>
    </ThemeProvider>
  );
}
