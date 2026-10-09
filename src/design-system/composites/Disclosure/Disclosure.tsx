import { useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Icon } from '../../primitives';
import styles from './Disclosure.module.css';

export const disclosureAppearances = ['bordered', 'flush'] as const;
export type DisclosureAppearance = (typeof disclosureAppearances)[number];

export interface DisclosureOwnProps {
  /** Always-visible label that toggles the content. Keep it short; it is the control's accessible name. */
  summary: ReactNode;
  /** Content shown while open. */
  children?: ReactNode;
  /** `bordered`: a standalone panel. `flush`: a row inside another surface, separated by rules. */
  appearance?: DisclosureAppearance;
  /** Open on first render. The disclosure is uncontrolled after that. */
  defaultOpen?: boolean;
  /** Render the content only while open, for expensive content such as source files. */
  lazy?: boolean;
  /** Called after the person opens or closes it. */
  onOpenChange?: (open: boolean) => void;
}

export type DisclosureProps = DisclosureOwnProps &
  Omit<ComponentPropsWithRef<'details'>, keyof DisclosureOwnProps | 'open' | 'onToggle'>;

export const disclosureDefaults = { appearance: 'bordered', defaultOpen: false, lazy: false } as const satisfies Partial<DisclosureOwnProps>;

/**
 * Show-and-hide content on the native `<details>` and `<summary>` elements, which provide the
 * expanded state, Enter and Space toggling and find-in-page without script.
 */
export function Disclosure({
  summary,
  children,
  appearance = disclosureDefaults.appearance,
  defaultOpen = disclosureDefaults.defaultOpen,
  lazy = disclosureDefaults.lazy,
  onOpenChange,
  className,
  ...rest
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      className={[styles.disclosure, styles[appearance], className].filter(Boolean).join(' ')}
      // Only the initial value: after mount the native element owns its open state.
      open={defaultOpen}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpen(next);
        onOpenChange?.(next);
      }}
      {...rest}
    >
      <summary className={styles.summary}>
        <Icon name="chevronRight" className={styles.marker} />
        <span className={styles.label}>{summary}</span>
      </summary>
      {(!lazy || open) && <div className={styles.body}>{children}</div>}
    </details>
  );
}
