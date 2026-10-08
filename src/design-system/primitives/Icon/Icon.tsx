import type { ComponentPropsWithRef } from 'react';
import styles from './Icon.module.css';

const paths = {
  plus: 'M12 5v14M5 12h14',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6 6 18',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.6-4.6',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  refresh: 'M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  warning: 'M12 4 21 20H3zM12 10v4M12 17h.01',
  success: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l3 3 5-6',
  danger: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6M15 9l-6 6',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  externalLink: 'M14 5h5v5M19 5l-8 8M18 14v5H5V6h5',
  archive: 'M4 5h16v4H4zM6 9v10h12V9M10 13h4',
} as const;

export const iconNames = Object.keys(paths) as (keyof typeof paths)[];
export type IconName = keyof typeof paths;

export const iconSizes = ['small', 'medium', 'large'] as const;
export type IconSize = (typeof iconSizes)[number];

export interface IconOwnProps {
  name: IconName;
  /** Omit to match the surrounding text size (1em). */
  size?: IconSize;
  /** Accessible name. Omit for decorative icons, which are hidden from assistive technology. */
  label?: string;
}

export type IconProps = IconOwnProps & Omit<ComponentPropsWithRef<'svg'>, keyof IconOwnProps | 'children'>;

/** A stroke icon from a small fixed set, drawn in currentColor. */
export function Icon({ name, size, label, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className={[styles.icon, size && styles[size], className].filter(Boolean).join(' ')}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
