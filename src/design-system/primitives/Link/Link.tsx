import { createContext, useContext, type ComponentPropsWithRef, type MouseEvent, type ReactNode } from 'react';
import styles from './Link.module.css';

type Navigate = (href: string) => void;

const NavigationContext = createContext<Navigate | null>(null);

/**
 * Lets the application plug in client-side routing without the design system
 * depending on a router. Links still render real `<a href>` elements.
 */
export function LinkProvider({ navigate, children }: { navigate: Navigate; children: ReactNode }) {
  return <NavigationContext value={navigate}>{children}</NavigationContext>;
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
  const navigate = useContext(NavigationContext);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (
      event.defaultPrevented ||
      !navigate ||
      modified ||
      (target && target !== '_self') ||
      rest.download !== undefined ||
      !isClientRoutable(href)
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    <a
      href={href}
      target={target}
      className={[styles.link, styles[variant], className].filter(Boolean).join(' ')}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}
