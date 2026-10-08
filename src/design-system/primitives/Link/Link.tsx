import { createContext, useContext, useMemo, type ComponentPropsWithRef, type MouseEvent, type ReactNode } from 'react';
import styles from './Link.module.css';

type Navigate = (href: string) => void;

interface Navigation {
  navigate: Navigate;
  /** Turns an app path into the URL the browser loads, such as adding a deployment base path. */
  resolveHref?: (href: string) => string;
}

const NavigationContext = createContext<Navigation | null>(null);

/**
 * Lets the application plug in client-side routing without the design system
 * depending on a router. Links still render real `<a href>` elements.
 */
export function LinkProvider({
  navigate,
  resolveHref,
  children,
}: {
  navigate: Navigate;
  resolveHref?: (href: string) => string;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ navigate, resolveHref }), [navigate, resolveHref]);
  return <NavigationContext value={value}>{children}</NavigationContext>;
}

export const linkVariants = ['inline', 'standalone'] as const;
export type LinkVariant = (typeof linkVariants)[number];

export interface LinkOwnProps {
  /** Destination. App-relative paths ("/components/…") use the provider's navigate; others load normally. */
  href: string;
  /** `inline` for links inside running text (always underlined); `standalone` for navigation lists and card titles. Default `inline`. */
  variant?: LinkVariant;
}

export type LinkProps = LinkOwnProps & Omit<ComponentPropsWithRef<'a'>, keyof LinkOwnProps>;

function isClientRoutable(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

/** Navigation to another page or location. Use Button for actions that change state. */
export function Link({ href, variant = 'inline', className, onClick, target, children, ...rest }: LinkProps) {
  const navigation = useContext(NavigationContext);
  const routable = isClientRoutable(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (
      event.defaultPrevented ||
      !navigation ||
      modified ||
      (target && target !== '_self') ||
      rest.download !== undefined ||
      !routable
    ) {
      return;
    }
    event.preventDefault();
    navigation.navigate(href);
  };

  return (
    <a
      href={routable && navigation?.resolveHref ? navigation.resolveHref(href) : href}
      target={target}
      className={[styles.link, styles[variant], className].filter(Boolean).join(' ')}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}
